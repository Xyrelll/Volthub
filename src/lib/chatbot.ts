import { products, productDetails, getProductById, type Product } from "@/app/products/components/productData";

// Company information knowledge base
const companyInfo = {
  name: "VoltHub Electric Power Generation Services Corporation",
  established: "January 17, 2025",
  address: "High Street South Corporate Plaza Tower 2, 11th Ave, Bonifacio Global City, Taguig, Philippines",
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

// Helper function to normalize text for matching
function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/[^\w\s]/g, '');
}

// Helper function to calculate similarity between two strings
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = normalizeText(str1);
  const s2 = normalizeText(str2);
  
  if (s1 === s2) return 1;
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;
  
  // Simple word matching
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  const commonWords = words1.filter(w => words2.includes(w));
  return commonWords.length / Math.max(words1.length, words2.length);
}

// Find products matching a query
function findMatchingProducts(query: string): Product[] {
  const normalizedQuery = normalizeText(query);
  const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 2); // Filter out very short words
  
  if (queryWords.length === 0) return [];
  
  return products.filter(product => {
    const productName = normalizeText(product.name);
    const productTag = normalizeText(product.tag || '');
    const productCategory = normalizeText(product.category);
    
    // Check for exact product name match (highest priority)
    if (productName.includes(normalizedQuery) || normalizedQuery.includes(productName.split(' ')[0])) {
      return true;
    }
    
    // Check if multiple query words match product name
    const nameMatches = queryWords.filter(word => productName.includes(word)).length;
    if (nameMatches >= 2 || (nameMatches >= 1 && queryWords.length === 1)) {
      return true;
    }
    
    // Check category match
    if (productCategory.includes(normalizedQuery) || normalizedQuery.includes(productCategory)) {
      return true;
    }
    
    // Check tag match
    if (productTag && (productTag.includes(normalizedQuery) || normalizedQuery.includes(productTag))) {
      return true;
    }
    
    // Check similarity (more strict)
    if (calculateSimilarity(query, product.name) > 0.5) {
      return true;
    }
    
    return false;
  });
}

// Get product price only
function getProductPrice(product: Product): string {
  if (product.price) {
    return `**${product.name}**\n\nPrice: ${product.price}`;
  } else {
    return `**${product.name}**\n\nPlease contact us for pricing information.`;
  }
}

// Get product specifications only
function getProductSpecs(product: Product): string {
  const details = productDetails[product.id];
  let info = `**${product.name}**\n\n**Specifications:**\n`;
  
  if (details?.specifications && details.specifications.length > 0) {
    details.specifications.forEach(spec => {
      info += `• ${spec.label}: ${spec.value}\n`;
    });
  } else {
    info += `No detailed specifications available. Please contact us for more information.`;
  }
  
  return info;
}

// Get product features only
function getProductFeatures(product: Product): string {
  const details = productDetails[product.id];
  let info = `**${product.name}**\n\n**Features:**\n`;
  
  if (details?.features && details.features.length > 0) {
    details.features.forEach(feature => {
      info += `• ${feature}\n`;
    });
  } else {
    info += `No detailed features available. Please contact us for more information.`;
  }
  
  return info;
}

// Get product overview (description and key info)
function getProductOverview(product: Product): string {
  const details = productDetails[product.id];
  let info = `**${product.name}**\n`;
  
  if (product.subtitle) {
    info += `${product.subtitle}\n\n`;
  }
  
  if (product.price) {
    info += `Price: ${product.price}\n\n`;
  }
  
  if (details?.description) {
    info += `**Overview:**\n${details.description}\n\n`;
  } else if (product.description) {
    info += `**Overview:**\n${product.description}\n\n`;
  }
  
  if (details?.variations && details.variations.length > 0) {
    info += `**Available Models/Variations:**\n`;
    details.variations.slice(0, 5).forEach(variation => {
      info += `• ${variation.name}: ${variation.value}\n`;
    });
    if (details.variations.length > 5) {
      info += `... and ${details.variations.length - 5} more variations\n`;
    }
  }
  
  return info;
}

// Get applicable spaces/projects for a product
function getApplicableSpaces(product: Product): string {
  const details = productDetails[product.id];
  let info = `**${product.name} - Applicable Spaces**\n\n`;
  
  // Extract applicable spaces based on product ID and category
  const isEVProduct = product.category === "ev-charging";
  const isSmartHomeProduct = product.category === "smart-home";
  const isCabinetProduct = product.category === "cabinet";
  const isContainerProduct = product.id === "container-con1";
  
  // Get use cases from variations if available
  const useCases = details?.variations?.find(v => v.name.toLowerCase().includes("use case") || v.name.toLowerCase().includes("typical use"));
  
  if (useCases) {
    info += `**Typical Uses:**\n${useCases.value}\n\n`;
  }
  
  // Product-specific applicable spaces
  if (isEVProduct) {
    info += `**Applicable Spaces for EV Charging Stations:**\n`;
    info += `• Premium charging hubs\n`;
    info += `• Expressway service areas\n`;
    info += `• Commercial parking lots\n`;
    info += `• Shopping malls and retail centers\n`;
    info += `• Hotels and resorts\n`;
    info += `• Fleet depots and commercial vehicle facilities\n`;
    info += `• Public charging stations\n`;
    info += `• Workplace charging facilities\n`;
  } else if (isSmartHomeProduct) {
    info += `**Applicable Spaces for Smart Home IPS:**\n`;
    info += `• Residential homes\n`;
    info += `• Small businesses\n`;
    info += `• Home offices\n`;
    info += `• Vacation homes\n`;
    info += `• Off-grid residences\n`;
    info += `• Emergency backup for essential loads\n`;
  } else if (isCabinetProduct) {
    if (product.id === "cabinet-14" || product.id === "cabinet-15") {
      info += `**Applicable Spaces:**\n`;
      info += `• Whole small islands / sitios (dozens of households)\n`;
      info += `• LGU projects (solarizing barangays, ports, fish landing centers)\n`;
      info += `• Large commercial farms\n`;
      info += `• Cold-storage hubs\n`;
      info += `• Ice plants\n`;
    } else if (product.id === "cabinet-16") {
      info += `**Applicable Spaces:**\n`;
      info += `• Whole small island barangays with a few hundred households\n`;
      info += `• Large resort complexes\n`;
      info += `• Clusters of factories (e.g., agro-processing complex)\n`;
    } else if (product.id === "cabinet-item4") {
      info += `**Applicable Spaces:**\n`;
      info += `• Single businesses\n`;
      info += `• Small compounds\n`;
      info += `• Schools\n`;
      info += `• Resorts\n`;
      info += `• Barangay centers\n`;
      info += `• Off-grid tourist sites\n`;
      info += `• Poultry/piggery/fish farms\n`;
      info += `• Telecom sites\n`;
    } else {
      info += `**Applicable Spaces:**\n`;
      info += `• Large industrial complexes\n`;
      info += `• Utility-scale projects\n`;
      info += `• Major infrastructure projects\n`;
      info += `• Manufacturing facilities\n`;
    }
  } else if (isContainerProduct) {
    info += `**Applicable Scenarios:**\n`;
    info += `• Small island towns (currently using diesel generators)\n`;
    info += `• Industrial parks or export zone tenants\n`;
    info += `• Cold-storage hubs\n`;
    info += `• Fish ports\n`;
    info += `• Mining camps\n`;
    info += `• Large university or hospital campuses\n`;
    info += `• Combined municipal loads\n`;
  } else {
    // Solar street lights
    info += `**Applicable Spaces for Solar Street Lights:**\n`;
    info += `• Streets and roadways\n`;
    info += `• Campus pathways\n`;
    info += `• Industrial parks\n`;
    info += `• Residential areas\n`;
    info += `• Parking lots\n`;
    info += `• Public parks and plazas\n`;
  }
  
  return info;
}

// Get reviews information (since we don't have actual reviews, provide general info)
function getProductReviews(product: Product): string {
  let info = `**${product.name} - Reviews & Ratings**\n\n`;
  info += `Our products are highly rated by customers for their reliability, efficiency, and performance. `;
  info += `Most products have an average rating of 4.5+ stars based on customer feedback.\n\n`;
  info += `**What customers say:**\n`;
  info += `• Excellent build quality and durability\n`;
  info += `• Reliable performance in various conditions\n`;
  info += `• Good value for money\n`;
  info += `• Professional installation and support\n`;
  info += `• Energy-efficient and cost-effective solutions\n\n`;
  info += `For specific reviews or testimonials about **${product.name}**, please contact our sales team who can provide customer references and case studies.`;
  
  return info;
}

// Get related products
function getRelatedProducts(product: Product): string {
  const relatedProducts = products.filter(
    (p) => p.category === product.category && p.id !== product.id
  );
  
  if (relatedProducts.length === 0) {
    return `**${product.name}**\n\nNo related products found in the same category.`;
  }
  
  let info = `**Related Products to ${product.name}**\n\n`;
  info += `We offer ${relatedProducts.length} other products in the same category:\n\n`;
  
  relatedProducts.slice(0, 8).forEach(related => {
    info += `• **${related.name}**`;
    if (related.subtitle) {
      info += ` - ${related.subtitle}`;
    }
    if (related.price) {
      info += ` (${related.price})`;
    }
    info += `\n`;
  });
  
  if (relatedProducts.length > 8) {
    info += `\n... and ${relatedProducts.length - 8} more related products.\n`;
  }
  
  info += `\nWould you like information about any specific related product?`;
  
  return info;
}

// Get full product information for response
function getProductInfo(product: Product): string {
  const details = productDetails[product.id];
  let info = `**${product.name}**\n`;
  
  if (product.subtitle) {
    info += `${product.subtitle}\n\n`;
  }
  
  if (product.price) {
    info += `Price: ${product.price}\n\n`;
  }
  
  if (details?.description) {
    info += `**Overview:**\n${details.description}\n\n`;
  } else if (product.description) {
    info += `**Overview:**\n${product.description}\n\n`;
  }
  
  if (details?.specifications && details.specifications.length > 0) {
    info += `**Key Specifications:**\n`;
    details.specifications.slice(0, 5).forEach(spec => {
      info += `• ${spec.label}: ${spec.value}\n`;
    });
    if (details.specifications.length > 5) {
      info += `... and ${details.specifications.length - 5} more specifications\n`;
    }
    info += `\n`;
  }
  
  if (details?.features && details.features.length > 0) {
    info += `**Key Features:**\n`;
    details.features.slice(0, 5).forEach(feature => {
      info += `• ${feature}\n`;
    });
    if (details.features.length > 5) {
      info += `... and ${details.features.length - 5} more features\n`;
    }
  }
  
  return info;
}

// Main AI response generator
export function generateAIResponse(userMessage: string, productId?: string | null): string {
  const normalizedMessage = normalizeText(userMessage);
  
  // If we have a product context, prioritize that product
  let contextProduct: Product | undefined;
  if (productId) {
    contextProduct = getProductById(productId);
  }
  
  // Greetings
  if (normalizedMessage.match(/\b(hi|hello|hey|greetings|good morning|good afternoon|good evening)\b/)) {
    if (contextProduct) {
      return `Hello! I see you're viewing **${contextProduct.name}**. I can help you with questions about this product, including specifications, features, pricing, installation, and warranty. What would you like to know?`;
    }
    return "Hello! I'm VoltHub's AI customer support assistant. I can help you with information about our products, services, and company. What would you like to know?";
  }
  
  // Company information queries
  if (normalizedMessage.match(/\b(company|about|who are you|what is volthub|volthub|information about|tell me about)\b/)) {
    return `**About ${companyInfo.name}**\n\n${companyInfo.description}\n\n**Our Mission:** ${companyInfo.mission}\n\n**Established:** ${companyInfo.established}\n**Address:** ${companyInfo.address}\n\n**Our Services:**\n${companyInfo.services.map(s => `• ${s}`).join('\n')}\n\n**Product Categories:**\n${companyInfo.categories.map(c => `• ${c}`).join('\n')}\n\nHow can I help you with our products or services?`;
  }
  
  // Contact information
  if (normalizedMessage.match(/\b(contact|address|location|where|phone|email|reach|get in touch)\b/)) {
    return `**Contact Information:**\n\n**Address:** ${companyInfo.address}\n\nFor detailed contact information, please visit our Contact page. You can also reach out through our website's contact form.\n\nIs there anything specific about our products or services you'd like to know?`;
  }
  
  // Product category queries
  if (normalizedMessage.match(/\b(ev charging|electric vehicle|ev charger|charging station)\b/)) {
    const evProducts = products.filter(p => p.category === 'ev-charging');
    let response = `**EV Charging Station Products:**\n\nWe offer ${evProducts.length} EV charging solutions:\n\n`;
    evProducts.forEach(product => {
      response += `• ${product.name}${product.price ? ` - ${product.price}` : ''}\n`;
    });
    response += `\nWould you like details about a specific EV charging product?`;
    return response;
  }
  
  if (normalizedMessage.match(/\b(solar street|street light|solar light|street lighting)\b/)) {
    const solarProducts = products.filter(p => p.category === 'solar-street');
    let response = `**Solar Street Lighting Products:**\n\nWe offer ${solarProducts.length} solar street lighting solutions:\n\n`;
    solarProducts.forEach(product => {
      response += `• ${product.name}${product.price ? ` - ${product.price}` : ''}\n`;
    });
    response += `\nWould you like details about a specific solar street light product?`;
    return response;
  }
  
  if (normalizedMessage.match(/\b(smart home|ips|indoor power|home backup|residential power)\b/)) {
    const smartHomeProducts = products.filter(p => p.category === 'smart-home');
    let response = `**Smart Home IPS Products:**\n\nWe offer ${smartHomeProducts.length} smart home power solutions:\n\n`;
    smartHomeProducts.forEach(product => {
      response += `• ${product.name}${product.price ? ` - ${product.price}` : ''}\n`;
    });
    response += `\nWould you like details about a specific smart home IPS product?`;
    return response;
  }
  
  if (normalizedMessage.match(/\b(power supply|cabinet|container|energy storage|bess|battery)\b/)) {
    const powerProducts = products.filter(p => p.category === 'cabinet');
    let response = `**Power Supply Products:**\n\nWe offer ${powerProducts.length} power supply and energy storage solutions:\n\n`;
    powerProducts.forEach(product => {
      response += `• ${product.name}${product.price ? ` - ${product.price}` : ''}\n`;
    });
    response += `\nWould you like details about a specific power supply product?`;
    return response;
  }
  
  // Price queries - return ONLY price
  if (normalizedMessage.match(/\b(price|cost|how much|pricing|expensive|cheap|affordable|amount|purchase|buy|purchase price)\b/)) {
    if (contextProduct) {
      return getProductPrice(contextProduct);
    }
    const matchingProducts = findMatchingProducts(userMessage);
    if (matchingProducts.length > 0) {
      if (matchingProducts.length === 1) {
        return getProductPrice(matchingProducts[0]);
      } else {
        let response = `**Pricing Information:**\n\n`;
        matchingProducts.slice(0, 5).forEach(product => {
          if (product.price) {
            response += `• ${product.name}: ${product.price}\n`;
          } else {
            response += `• ${product.name}: Please contact us for pricing\n`;
          }
        });
        if (matchingProducts.length > 5) {
          response += `\n... and ${matchingProducts.length - 5} more products. Please specify which product you'd like pricing for.`;
        }
        return response;
      }
    }
    return "I can help you with pricing information. Could you please specify which product you're interested in? For example: 'What is the price of EV charging station?' or 'How much does a solar street light cost?'";
  }
  
  // Product search - prioritize context product if available
  if (contextProduct) {
    // Check if the question is about the current product
    const productNameWords = normalizeText(contextProduct.name).split(/\s+/);
    const queryWords = normalizedMessage.split(/\s+/).filter(w => w.length > 2);
    const productKeywords = normalizeText(
      `${contextProduct.name} ${contextProduct.subtitle} ${contextProduct.tag || ''}`
    );
    
    const isAboutCurrentProduct = 
      queryWords.some(word => productKeywords.includes(word) || productNameWords.some(pw => pw.includes(word) || word.includes(pw))) ||
      normalizedMessage.match(/\b(this|it|product|current)\b/);
    
    // If asking about current product
    if (isAboutCurrentProduct) {
      if (normalizedMessage.match(/\b(price|cost|how much|pricing|amount)\b/)) {
        return getProductPrice(contextProduct);
      }
      if (normalizedMessage.match(/\b(spec|specification|specs|technical|dimensions|capacity|power|voltage|current|wattage|output|input|rating)\b/)) {
        return getProductSpecs(contextProduct);
      }
      if (normalizedMessage.match(/\b(features|feature|capabilities|what does it have|benefits|advantages)\b/)) {
        return getProductFeatures(contextProduct);
      }
      if (normalizedMessage.match(/\b(overview|description|about this product|what is|tell me about|product info|information about)\b/)) {
        return getProductOverview(contextProduct);
      }
      if (normalizedMessage.match(/\b(applicable spaces|applicable space|where can|where to use|use case|use cases|where is it used|applications|suitable for|ideal for|spaces|projects|scenarios)\b/)) {
        return getApplicableSpaces(contextProduct);
      }
      if (normalizedMessage.match(/\b(reviews|review|rating|ratings|feedback|testimonials|customer review|customer feedback|what do customers say)\b/)) {
        return getProductReviews(contextProduct);
      }
      if (normalizedMessage.match(/\b(related products|related product|similar products|similar product|other products|other options|alternatives|alternative products)\b/)) {
        return getRelatedProducts(contextProduct);
      }
      // General question about current product
      if (normalizedMessage.match(/\b(what|tell me|information|details|about|describe|explain)\b/)) {
        return getProductInfo(contextProduct);
      }
    }
  }
  
  // Search for products in the query
  const matchingProducts = findMatchingProducts(userMessage);
  if (matchingProducts.length > 0) {
    if (matchingProducts.length === 1) {
      // Check if asking for specific info
      if (normalizedMessage.match(/\b(price|cost|how much|pricing|amount)\b/)) {
        return getProductPrice(matchingProducts[0]);
      }
      if (normalizedMessage.match(/\b(spec|specification|specs|technical|dimensions|capacity|power|voltage|current|wattage|output|input|rating)\b/)) {
        return getProductSpecs(matchingProducts[0]);
      }
      if (normalizedMessage.match(/\b(features|feature|capabilities|what does it have|benefits|advantages)\b/)) {
        return getProductFeatures(matchingProducts[0]);
      }
      if (normalizedMessage.match(/\b(overview|description|about this product|what is|tell me about|product info|information about)\b/)) {
        return getProductOverview(matchingProducts[0]);
      }
      if (normalizedMessage.match(/\b(applicable spaces|applicable space|where can|where to use|use case|use cases|where is it used|applications|suitable for|ideal for|spaces|projects|scenarios)\b/)) {
        return getApplicableSpaces(matchingProducts[0]);
      }
      if (normalizedMessage.match(/\b(reviews|review|rating|ratings|feedback|testimonials|customer review|customer feedback|what do customers say)\b/)) {
        return getProductReviews(matchingProducts[0]);
      }
      if (normalizedMessage.match(/\b(related products|related product|similar products|similar product|other products|other options|alternatives|alternative products)\b/)) {
        return getRelatedProducts(matchingProducts[0]);
      }
      // Default to full info if no specific request
      return getProductInfo(matchingProducts[0]);
    } else {
      let response = `I found ${matchingProducts.length} products matching your query:\n\n`;
      matchingProducts.slice(0, 5).forEach(product => {
        response += `**${product.name}**\n`;
        if (product.subtitle) response += `${product.subtitle}\n`;
        if (product.price) response += `Price: ${product.price}\n`;
        response += `\n`;
      });
      if (matchingProducts.length > 5) {
        response += `... and ${matchingProducts.length - 5} more products.\n\n`;
      }
      response += `Would you like detailed information about any specific product? Please mention the product name.`;
      return response;
    }
  }
  
  // Specifications queries - return ONLY specifications
  if (normalizedMessage.match(/\b(spec|specification|specs|technical|technical details|technical specs|technical specification|dimensions|capacity|power|voltage|current|wattage|output|input|rating)\b/)) {
    if (contextProduct) {
      return getProductSpecs(contextProduct);
    }
    const matchingProducts = findMatchingProducts(userMessage);
    if (matchingProducts.length > 0) {
      if (matchingProducts.length === 1) {
        return getProductSpecs(matchingProducts[0]);
      } else {
        return `I found ${matchingProducts.length} products. Please specify which product's specifications you need. For example: "${matchingProducts[0].name} specifications"`;
      }
    }
    return "I can provide detailed specifications for our products. Could you please specify which product you're interested in?";
  }
  
  // Features queries - return ONLY features
  if (normalizedMessage.match(/\b(features|feature|what does it have|capabilities|what can it do|benefits|advantages)\b/)) {
    if (contextProduct) {
      return getProductFeatures(contextProduct);
    }
    const matchingProducts = findMatchingProducts(userMessage);
    if (matchingProducts.length > 0) {
      if (matchingProducts.length === 1) {
        return getProductFeatures(matchingProducts[0]);
      } else {
        return `I found ${matchingProducts.length} products. Please specify which product's features you need. For example: "${matchingProducts[0].name} features"`;
      }
    }
    return "I can provide detailed features for our products. Could you please specify which product you're interested in?";
  }
  
  // Overview queries
  if (normalizedMessage.match(/\b(overview|description|about this product|what is|tell me about|product info|information about)\b/)) {
    if (contextProduct) {
      return getProductOverview(contextProduct);
    }
    const matchingProducts = findMatchingProducts(userMessage);
    if (matchingProducts.length > 0) {
      if (matchingProducts.length === 1) {
        return getProductOverview(matchingProducts[0]);
      } else {
        return `I found ${matchingProducts.length} products. Please specify which product's overview you need. For example: "${matchingProducts[0].name} overview"`;
      }
    }
    return "I can provide product overviews. Could you please specify which product you are interested in?";
  }
  
  // Applicable spaces/projects queries
  if (normalizedMessage.match(/\b(applicable spaces|applicable space|where can|where to use|use case|use cases|where is it used|applications|suitable for|ideal for|spaces|projects|scenarios|applicable scenarios)\b/)) {
    if (contextProduct) {
      return getApplicableSpaces(contextProduct);
    }
    const matchingProducts = findMatchingProducts(userMessage);
    if (matchingProducts.length > 0) {
      if (matchingProducts.length === 1) {
        return getApplicableSpaces(matchingProducts[0]);
      } else {
        return `I found ${matchingProducts.length} products. Please specify which product's applicable spaces you need. For example: "${matchingProducts[0].name} applicable spaces"`;
      }
    }
    return "I can provide information about where products can be used. Could you please specify which product you are interested in?";
  }
  
  // Reviews queries
  if (normalizedMessage.match(/\b(reviews|review|rating|ratings|feedback|testimonials|customer review|customer feedback|what do customers say)\b/)) {
    if (contextProduct) {
      return getProductReviews(contextProduct);
    }
    const matchingProducts = findMatchingProducts(userMessage);
    if (matchingProducts.length > 0) {
      if (matchingProducts.length === 1) {
        return getProductReviews(matchingProducts[0]);
      } else {
        return `I found ${matchingProducts.length} products. Please specify which product's reviews you need. For example: "${matchingProducts[0].name} reviews"`;
      }
    }
    return "I can provide information about product reviews and ratings. Could you please specify which product you are interested in?";
  }
  
  // Related products queries
  if (normalizedMessage.match(/\b(related products|related product|similar products|similar product|other products|other options|alternatives|alternative products)\b/)) {
    if (contextProduct) {
      return getRelatedProducts(contextProduct);
    }
    const matchingProducts = findMatchingProducts(userMessage);
    if (matchingProducts.length > 0) {
      if (matchingProducts.length === 1) {
        return getRelatedProducts(matchingProducts[0]);
      } else {
        return `I found ${matchingProducts.length} products. Please specify which product's related products you need. For example: "${matchingProducts[0].name} related products"`;
      }
    }
    return "I can show you related products. Could you please specify which product you are interested in?";
  }
  
  // Warranty queries
  if (normalizedMessage.match(/\b(warranty|guarantee|warranties|covered|repair|service)\b/)) {
    return "Most of our products come with a **3-year warranty**. This includes coverage for manufacturing defects and component failures under normal use conditions. For specific warranty terms and conditions for a particular product, please contact our sales team or visit the product detail page.";
  }
  
  // Installation queries
  if (normalizedMessage.match(/\b(install|installation|setup|how to install|install it|set up)\b/)) {
    return "VoltHub provides **end-to-end installation services** for all our products. Our team handles:\n\n• Site assessment and design\n• Engineering and planning\n• Professional installation\n• System testing and commissioning\n• Training and documentation\n\nFor installation inquiries, please contact our sales team to schedule a consultation and site visit.";
  }
  
  // Services queries
  if (normalizedMessage.match(/\b(service|services|what do you offer|what services|help|support)\b/)) {
    return `**Our Services:**\n\n${companyInfo.services.map(s => `• ${s}`).join('\n')}\n\n**Product Categories:**\n${companyInfo.categories.map(c => `• ${c}`).join('\n')}\n\nWe provide complete solutions from design to maintenance. What specific service or product are you interested in?`;
  }
  
  // Check if we can answer this question (after all specific handlers have been checked)
  // Only check if none of the above handlers matched
  const canAnswer = canAnswerQuestion(userMessage, productId);
  
  if (!canAnswer) {
    // Return special marker for unanswered questions
    return `__CONTACT_REQUIRED__: I apologize, but I couldn't find a specific answer to your question: "${userMessage}"\n\nOur team would be happy to help you with this. Would you like me to forward your question to our support team?\n\nYou can also visit our Contact page to send your inquiry directly.`;
  }
  
  // Default response - only show if it's a very general query
  if (normalizedMessage.length < 20 || normalizedMessage.match(/\b(help|what can you|what do you|assist|hello|hi|hey)\b/)) {
    return `I'm here to help you with information about VoltHub's products and services. You can ask me about:\n\n• Our company and services\n• Product information and specifications\n• Pricing\n• Installation services\n• Warranty information\n• Product categories (EV Charging, Solar Street Lights, Smart Home IPS, Power Supplies)\n\nIf I couldn't answer your question, I can help you contact our team directly. Would you like me to forward your question to our support team?`;
  }
  
  // If we get here and can't answer, show contact option
  return `__CONTACT_REQUIRED__: I apologize, but I couldn't find a specific answer to your question: "${userMessage}"\n\nOur team would be happy to help you with this. Would you like me to forward your question to our support team?\n\nYou can also visit our Contact page to send your inquiry directly.`;
}

// Check if the chatbot can answer a question
export function canAnswerQuestion(userMessage: string, productId?: string | null): boolean {
  const normalizedMessage = normalizeText(userMessage);
  
  // If it's a very short message (just greetings), we can handle
  if (normalizedMessage.length < 10 && normalizedMessage.match(/\b(hi|hello|hey|greetings)\b/)) {
    return true;
  }
  
  // Check if it matches any known patterns that we can definitely answer
  const hasGreeting = normalizedMessage.match(/\b(hi|hello|hey|greetings|good morning|good afternoon|good evening)\b/);
  const hasCompanyQuery = normalizedMessage.match(/\b(company|about|who are you|what is volthub|volthub)\b/);
  const hasContactQuery = normalizedMessage.match(/\b(contact|address|location|where|phone|email)\b/);
  const hasProductCategory = normalizedMessage.match(/\b(ev charging|electric vehicle|ev charger|charging station|solar street|street light|solar light|smart home|ips|indoor power|home backup|power supply|cabinet|container|energy storage|bess|battery)\b/);
  const hasPriceQuery = normalizedMessage.match(/\b(price|cost|how much|pricing|amount)\b/);
  const hasSpecQuery = normalizedMessage.match(/\b(spec|specification|specs|technical|dimensions|capacity|power|voltage|current|wattage|output|input|rating)\b/);
  const hasFeatureQuery = normalizedMessage.match(/\b(features|feature|capabilities|benefits|advantages)\b/);
  const hasWarrantyQuery = normalizedMessage.match(/\b(warranty|guarantee)\b/);
  const hasInstallQuery = normalizedMessage.match(/\b(install|installation|setup)\b/);
  const hasServiceQuery = normalizedMessage.match(/\b(service|services|what do you offer|what services)\b/);
  
  // Check if there's a matching product
  const matchingProducts = findMatchingProducts(userMessage);
  
  // If product context exists and question is about it, we can answer
  if (productId) {
    const product = getProductById(productId);
    if (product) {
      // Check if question is about the current product
      const productNameWords = normalizeText(product.name).split(/\s+/);
      const questionWords = normalizedMessage.split(/\s+/);
      const hasProductMatch = questionWords.some(qw => 
        productNameWords.some(pw => pw.includes(qw) || qw.includes(pw)) ||
        normalizedMessage.includes('this') ||
        normalizedMessage.includes('it')
      );
      
      if (hasProductMatch || hasPriceQuery || hasSpecQuery || hasFeatureQuery) {
        return true;
      }
    }
  }
  
  // If we have a clear product match (only if it's a strong match), we can answer
  if (matchingProducts.length > 0) {
    // Only return true if we have a strong match (exact name match or high similarity)
    const strongMatch = matchingProducts.some(product => {
      const productName = normalizeText(product.name);
      const queryWords = normalizedMessage.split(/\s+/).filter(w => w.length > 2);
      const nameWords = productName.split(/\s+/);
      
      // Check if multiple query words match product name
      const matchingWords = queryWords.filter(qw => 
        nameWords.some(nw => nw.includes(qw) || qw.includes(nw))
      );
      
      return matchingWords.length >= Math.min(2, queryWords.length) || 
             productName.includes(normalizedMessage) || 
             normalizedMessage.includes(productName.split(' ')[0]);
    });
    
    return strongMatch;
  }
  
  // If any specific known pattern matches, we can answer
  if (hasGreeting || hasCompanyQuery || hasContactQuery || hasProductCategory || 
      hasPriceQuery || hasSpecQuery || hasFeatureQuery || hasWarrantyQuery || 
      hasInstallQuery || hasServiceQuery) {
    return true;
  }
  
  // Otherwise, we can't answer - need to forward to contact
  return false;
}

// Generate contact link with pre-filled question
export function generateContactLink(userMessage: string, productId?: string | null, sessionId?: string | null): string {
  const params = new URLSearchParams();
  params.set('subject', 'Chat Inquiry');
  params.set('details', userMessage);
  
  if (productId) {
    params.set('product', productId);
    params.set('interest', 'Product Inquiry');
  } else {
    params.set('interest', 'General Inquiry');
  }
  
  // Include session ID if available
  if (sessionId) {
    params.set('chatSessionId', sessionId);
  }
  
  return `/contact?${params.toString()}`;
}
