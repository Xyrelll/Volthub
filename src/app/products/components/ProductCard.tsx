import Image from "next/image";
import Link from "next/link";
import { RiArrowRightSLine, RiBatteryChargeLine, RiChargingPile2Line, RiHomeGearLine, RiSunLine } from "react-icons/ri";
import { Product } from "./productData";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
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
      </div>

      <div className="p-4 md:p-5 lg:p-6 flex flex-col gap-2 md:gap-3 flex-1">
        <div className="flex items-center gap-2 text-xs text-slate-500 ">
          {product.category === "smart-home" && (
            <RiHomeGearLine className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary shrink-0" />
          )}
          {product.category === "ev-charging" && (
            <RiChargingPile2Line className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary shrink-0" />
          )}
          {product.category === "solar-street" && (
            <RiSunLine className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary shrink-0" />
          )}
          {(product.category === "cabinet" 
            // product.category === "container"
          ) 
            && (
            <RiBatteryChargeLine className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary shrink-0" />
          )}
          <span className="uppercase tracking-[0.16em] truncate">
            {product.category === "all"
              ? "All Products"
              : product.category === "ev-charging"
              ? "EV Charging Station"
              : product.category === "solar-street"
              ? "Solar Street Lights"
              : product.category === "smart-home"
              ? "Smart Home IPS"
              : product.category === "cabinet"
              ? "Power Supplies"
              : product.category}
          </span>
        </div>

        <h3 className="text-base md:text-lg lg:text-xl font-semibold text-slate-900 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-xs md:text-sm text-slate-600 flex-1 line-clamp-2">{product.subtitle}</p>

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

