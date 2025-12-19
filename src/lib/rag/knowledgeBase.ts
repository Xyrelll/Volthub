/**
 * Knowledge Base for RAG (Retrieval Augmented Generation)
 * Extracts and indexes project context for the LLM
 */

import type { Product } from "@/app/products/components/productData";
import { createServerClient } from "@/lib/supabase";

/**
 * Get product by ID from Supabase (server-side)
 */
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const supabase = createServerClient();
    const { data: product, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !product) {
      return null;
    }

    return {
      id: product.id,
      name: product.name,
      subtitle: product.subtitle || "",
      category: product.category as Product["category"],
      tag: product.tag || undefined,
      image: product.image,
      images: Array.isArray(product.images) ? product.images : [],
      price: product.price || undefined,
      description: product.description || undefined,
      variations: Array.isArray(product.variations) ? product.variations : [],
      specifications: Array.isArray(product.specifications)
        ? product.specifications
        : [],
      features: Array.isArray(product.features) ? product.features : [],
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

// Company information
const companyInfo = {
  name: "VoltHub Electric Power Generation Services Corporation",
  established: "January 17, 2025",
  address: "High Street South Corporate Plaza Tower 2, 11th Ave, Bonifacio Global City, Taguig, Philippines",
  phone: "+63 9659700823",
  email: "admin-help@volthub-ev.com",
  website: "https://volthubssupabase.app.netlify",
  description: "A forward-looking energy technology company specializing in EV charging infrastructure, solar power systems, and smart energy solutions.",
  mission: "Building the blueprint for a cleaner energy economy. We provide end-to-end services—from design, engineering, and installation to maintenance and system optimization—tailored for commercial, residential, and industrial clients.",
  services: [
    "EV charging infrastructure",
    "Solar power systems",
    "Smart energy solutions",
    "Battery storage systems",
    "Energy management systems"
  ],
  categories: [
    "EV Charging Stations",
    "Solar Street Lights",
    "Smart Home IPS (Indoor Power Systems)",
    "Power Supplies (Cabinet and Container systems)"
  ]
};

export interface KnowledgeChunk {
  id: string;
  type: 'company' | 'product' | 'service' | 'category';
  content: string;
  metadata: {
    productId?: string;
    productName?: string;
    category?: string;
    tags?: string[];
  };
}

/**
 * Build knowledge base from project data
 */
export async function buildKnowledgeBase(): Promise<KnowledgeChunk[]> {
  const chunks: KnowledgeChunk[] = [];
  
  // Fetch products from Supabase
  let products: Product[] = [];
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (!error && data) {
      products = data.map((product: {
        id: string;
        name: string;
        subtitle: string | null;
        category: string;
        tag: string | null;
        image: string;
        images: string[] | null;
        price: string | null;
        description: string | null;
        variations: Product["variations"] | null;
        specifications: Product["specifications"] | null;
        features: Product["features"] | null;
      }) => ({
        id: product.id,
        name: product.name,
        subtitle: product.subtitle || "",
        category: product.category as Product["category"],
        tag: product.tag || undefined,
        image: product.image,
        images: Array.isArray(product.images) ? product.images : [],
        price: product.price || undefined,
        description: product.description || undefined,
        variations: Array.isArray(product.variations) ? product.variations : [],
        specifications: Array.isArray(product.specifications)
          ? product.specifications
          : [],
        features: Array.isArray(product.features) ? product.features : [],
      }));
    }
  } catch (error) {
    console.error("Error fetching products for knowledge base:", error);
  }

  // Add company information
  chunks.push({
    id: 'company-info',
    type: 'company',
    content: `Company: ${companyInfo.name}
Established: ${companyInfo.established}
Address: ${companyInfo.address}
Phone: ${companyInfo.phone}
Email: ${companyInfo.email}
Website: ${companyInfo.website}
Description: ${companyInfo.description}
Mission: ${companyInfo.mission}
Services: ${companyInfo.services.join(', ')}
Product Categories: ${companyInfo.categories.join(', ')}`,
    metadata: {}
  });

  // Add contact information chunk (for easy retrieval)
  chunks.push({
    id: 'contact-info',
    type: 'company',
    content: `Contact Information for ${companyInfo.name}:
Phone: ${companyInfo.phone}
Email: ${companyInfo.email}
Address: ${companyInfo.address}
Website: ${companyInfo.website}

For inquiries, support, returns, warranties, or any questions, please contact us using the information above. You can also visit our website at ${companyInfo.website} for more information.`,
    metadata: {}
  });

  // Add product information
  products.forEach((product: Product) => {
    // Product details are now part of the product object
    const details = {
      description: product.description,
      specifications: product.specifications || [],
      features: product.features || [],
      variations: product.variations || [],
    };
    
    // Product overview chunk
    let productContent = `Product: ${product.name}`;
    if (product.subtitle) productContent += `\nSubtitle: ${product.subtitle}`;
    if (product.description) productContent += `\nDescription: ${product.description}`;
    if (product.price) productContent += `\nPrice: ${product.price}`;
    if (product.tag) productContent += `\nTag: ${product.tag}`;
    productContent += `\nCategory: ${product.category}`;

    if (details?.description) {
      productContent += `\nDetailed Description: ${details.description}`;
    }

    // Specifications
    if (details?.specifications && details.specifications.length > 0) {
      productContent += `\nSpecifications:`;
      details.specifications.forEach((spec: { label: string; value: string }) => {
        productContent += `\n- ${spec.label}: ${spec.value}`;
      });
    }

    // Features
    if (details?.features && details.features.length > 0) {
      productContent += `\nFeatures: ${details.features.join(', ')}`;
    }

    // Variations
    if (details?.variations && details.variations.length > 0) {
      productContent += `\nAvailable Variations:`;
      details.variations.forEach((variation: { name: string; value: string; description?: string }) => {
        productContent += `\n- ${variation.name}: ${variation.value}`;
        if (variation.description) {
          productContent += ` (${variation.description})`;
        }
      });
    }

    chunks.push({
      id: `product-${product.id}`,
      type: 'product',
      content: productContent,
      metadata: {
        productId: product.id,
        productName: product.name,
        category: product.category,
        tags: product.tag ? [product.tag] : []
      }
    });

    // Add applicable spaces/use cases
    const applicableSpaces = getApplicableSpacesForProduct(product);
    if (applicableSpaces) {
      chunks.push({
        id: `product-${product.id}-spaces`,
        type: 'product',
        content: `Product: ${product.name}\nApplicable Spaces and Use Cases:\n${applicableSpaces}`,
        metadata: {
          productId: product.id,
          productName: product.name,
          category: product.category
        }
      });
    }
  });

  // Add category information
  const categoryInfo: Record<string, string> = {
    'ev-charging': 'EV Charging Stations are designed for electric vehicle charging infrastructure. Suitable for premium charging hubs, expressway service areas, commercial parking lots, shopping malls, hotels, fleet depots, and workplace charging facilities.',
    'solar-street': 'Solar Street Lights provide sustainable lighting solutions for streets, roadways, campus pathways, industrial parks, residential areas, parking lots, and public parks.',
    'smart-home': 'Smart Home IPS (Indoor Power Systems) are designed for residential homes, small businesses, home offices, vacation homes, off-grid residences, and emergency backup systems.',
    'cabinet': 'Power Supply Cabinet systems are scalable solutions for whole small islands, LGU projects, large commercial farms, cold-storage hubs, ice plants, resort complexes, and industrial complexes.'
  };

  Object.entries(categoryInfo).forEach(([category, description]) => {
    chunks.push({
      id: `category-${category}`,
      type: 'category',
      content: `Category: ${category}\nDescription: ${description}`,
      metadata: {
        category
      }
    });
  });

  // Add service information
  chunks.push({
    id: 'services',
    type: 'service',
    content: `VoltHub Services:
- End-to-end installation services for all products
- Site assessment and design
- Engineering and planning
- Professional installation
- System testing and commissioning
- Training and documentation
- Maintenance and system optimization
- 3-year warranty on most products
- Technical support and consultation`,
    metadata: {}
  });

  return chunks;
}

/**
 * Get applicable spaces for a product
 */
function getApplicableSpacesForProduct(product: Product): string | null {
  const isEVProduct = product.category === "ev-charging";
  const isSmartHomeProduct = product.category === "smart-home";
  const isCabinetProduct = product.category === "cabinet";
  const isContainerProduct = product.id === "container-con1";

  if (isEVProduct) {
    return `- Premium charging hubs
- Expressway service areas
- Commercial parking lots
- Shopping malls and retail centers
- Hotels and resorts
- Fleet depots and commercial vehicle facilities
- Public charging stations
- Workplace charging facilities`;
  }

  if (isSmartHomeProduct) {
    return `- Residential homes
- Small businesses
- Home offices
- Vacation homes
- Off-grid residences
- Emergency backup for essential loads`;
  }

  if (isCabinetProduct) {
    if (product.id === "cabinet-14" || product.id === "cabinet-15") {
      return `- Whole small islands / sitios (dozens of households)
- LGU projects (solarizing barangays, ports, fish landing centers)
- Large commercial farms
- Cold-storage hubs
- Ice plants`;
    } else if (product.id === "cabinet-16") {
      return `- Whole small island barangays with a few hundred households
- Large resort complexes
- Clusters of factories (e.g., agro-processing complex)`;
    } else if (product.id === "cabinet-item4") {
      return `- Single businesses
- Small compounds
- Schools
- Resorts
- Barangay centers
- Off-grid tourist sites
- Poultry/piggery/fish farms
- Telecom sites`;
    } else {
      return `- Large industrial complexes
- Utility-scale projects
- Major infrastructure projects
- Manufacturing facilities`;
    }
  }

  if (isContainerProduct) {
    return `- Small island towns (currently using diesel generators)
- Industrial parks or export zone tenants
- Cold-storage hubs
- Fish ports
- Mining camps
- Large university or hospital campuses
- Combined municipal loads`;
  }

  // Solar street lights
  if (product.category === "solar-street") {
    return `- Streets and roadways
- Campus pathways
- Industrial parks
- Residential areas
- Parking lots
- Public parks and plazas`;
  }

  return null;
}

/**
 * Simple text similarity search (can be replaced with proper vector embeddings)
 */
export function searchKnowledgeBase(
  query: string,
  knowledgeBase: KnowledgeChunk[],
  limit: number = 5
): KnowledgeChunk[] {
  const normalizedQuery = query.toLowerCase().trim();
  const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 2);

  if (queryWords.length === 0) {
    return knowledgeBase.slice(0, limit);
  }

  // Check if query is about contact information
  const isContactQuery = normalizedQuery.match(/\b(contact|phone|email|address|reach|support|return|warranty|policy|help|get in touch)\b/);

  // Score each chunk based on keyword matches
  const scoredChunks = knowledgeBase.map(chunk => {
    const content = chunk.content.toLowerCase();
    let score = 0;

    // Boost contact-info chunk for contact queries
    if (isContactQuery && chunk.id === 'contact-info') {
      score += 20;
    }

    // Exact phrase match
    if (content.includes(normalizedQuery)) {
      score += 10;
    }

    // Word matches
    queryWords.forEach(word => {
      if (content.includes(word)) {
        score += 2;
      }
    });

    // Product name match
    if (chunk.metadata.productName) {
      const productName = chunk.metadata.productName.toLowerCase();
      queryWords.forEach(word => {
        if (productName.includes(word)) {
          score += 5;
        }
      });
    }

    // Category match
    if (chunk.metadata.category) {
      const category = chunk.metadata.category.toLowerCase();
      if (normalizedQuery.includes(category) || category.includes(normalizedQuery.split(' ')[0])) {
        score += 3;
      }
    }

    return { chunk, score };
  });

  // Sort by score and return top results
  return scoredChunks
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.chunk);
}

/**
 * Get relevant context for a query
 */
export async function getRelevantContext(
  query: string,
  productId?: string | null,
  maxChunks: number = 5
): Promise<string> {
  const knowledgeBase = await buildKnowledgeBase();
  
  // If we have a product context, prioritize that product
  if (productId) {
    const product = await getProductById(productId);
    const productChunks = knowledgeBase.filter(
      chunk => chunk.metadata.productId === productId
    );
    
    // Add a special context chunk about the current page
    if (product && productChunks.length > 0) {
      const pageContext = `CURRENT PAGE CONTEXT: The user is currently viewing the product page for "${product.name}". 
When they refer to "this product", "this page", "what page am I on", or ask questions without specifying a product name, 
they are asking about "${product.name}". Always assume questions about "this product" refer to "${product.name}".`;
      
      // For contact queries, prioritize contact-info chunk
      const isContactQuery = query.toLowerCase().match(/\b(contact|phone|email|address|reach|support|return|warranty|policy|help|get in touch)\b/);
      const contactChunk = knowledgeBase.find(c => c.id === 'contact-info');
      
      // Get other relevant chunks (excluding current product chunks and contact chunk if we'll add it separately)
      const otherChunks = searchKnowledgeBase(
        query, 
        knowledgeBase.filter(c => c.metadata.productId !== productId && c.id !== 'contact-info'), 
        Math.max(1, maxChunks - productChunks.length - (contactChunk && isContactQuery ? 1 : 0) - 1)
      );
      
      // If it's a contact query, ensure contact-info is included
      if (isContactQuery && contactChunk) {
        const allChunks = [
          pageContext,
          contactChunk.content, // Prioritize contact info
          ...productChunks.map(c => c.content),
          ...otherChunks.map(c => c.content)
        ];
        return allChunks.join('\n\n---\n\n');
      }
      
      // Combine: page context first, then product chunks, then other chunks
      const allChunks = [
        pageContext,
        ...productChunks.map(c => c.content),
        ...otherChunks.map(c => c.content)
      ];
      
      return allChunks.join('\n\n---\n\n');
    }
  }

  // Search for relevant chunks
  const isContactQuery = query.toLowerCase().match(/\b(contact|phone|email|address|reach|support|return|warranty|policy|help|get in touch)\b/);
  const contactChunk = knowledgeBase.find(c => c.id === 'contact-info');
  
  // If it's a contact query, prioritize contact-info chunk
  if (isContactQuery && contactChunk) {
    const otherChunks = searchKnowledgeBase(
      query,
      knowledgeBase.filter(c => c.id !== 'contact-info'),
      maxChunks - 1
    );
    return [contactChunk.content, ...otherChunks.map(c => c.content)].join('\n\n---\n\n');
  }
  
  const relevantChunks = searchKnowledgeBase(query, knowledgeBase, maxChunks);
  return relevantChunks.map(chunk => chunk.content).join('\n\n---\n\n');
}
