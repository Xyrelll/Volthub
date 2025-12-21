import Image from "next/image";
import Link from "next/link";
import { 
  RiArrowRightSLine, 
  // RiBatteryChargeLine,
  // RiChargingPile2Line, 
  // RiHomeGearLine, 
  // RiSunLine 
} from "react-icons/ri";
import { Product } from "./productData";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Get icon for product category
  // const getCategoryIcon = () => {
  //   switch (product.category) {
  //     case "smart-home":
  //       return RiHomeGearLine;
  //     case "ev-charging":
  //       return RiChargingPile2Line;
  //     case "solar-street":
  //       return RiSunLine;
  //     case "cabinet":
  //       return RiBatteryChargeLine;
  //     default:
  //       return null;
  //   }
  // };

  // const Icon = getCategoryIcon();

  return (
    <Link href={`/products/${product.id}`}>
      <article className="group bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col border border-slate-100 cursor-pointer h-full">
        <div className="relative overflow-hidden bg-slate-100">
          <Image
            src={product.image}
            alt={product.name}
            width={640}
            height={420}
            className="w-full h-48 md:h-52 lg:h-56 object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
          <div className="absolute inset-0 pointer-events-none bg-linear-to-t from-black/5 via-transparent to-transparent opacity-70" />
          {/* Logo overlay - top left */}
          <div className="absolute top-3 left-3 z-10">
            <Image
              src="/logo2.png"
              alt="Volthub Logo"
              width={80}
              height={80}
              className="h-12 w-12 md:h-14 md:w-14 object-contain drop-shadow-lg"
            />
          </div>
        </div>

        <div className="p-4 md:p-5 lg:p-6 flex flex-col gap-3 md:gap-4 flex-1">
          <h3 className="text-lg md:text-xl lg:text-2xl font-semibold text-slate-900 line-clamp-2 leading-tight">
            {product.name}
          </h3>
          <p className="text-sm md:text-base text-slate-600 flex-1 line-clamp-2">
            {product.subtitle}
          </p>

          <div className="flex items-center justify-between pt-1 gap-2">
            {product.tag && (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 md:px-3 md:py-1 text-xs font-medium text-slate-700 truncate">
                {product.tag}
              </span>
            )}
            <div className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-1.5 transition-all shrink-0">
              <span className="hidden sm:inline">Learn More</span>
              <span className="sm:hidden">More</span>
              <RiArrowRightSLine className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

