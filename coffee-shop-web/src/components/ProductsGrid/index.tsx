import { type RoastCollection } from '@/constants/roast'
import ProductCard from '@/components/ProductCard'

export interface ProductsGridProps {
  collections: RoastCollection[]
}

export const ProductsGrid = ({ collections }: ProductsGridProps) => {
  return (
    <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 xl:grid-cols-4">
      {collections.map((item) => (
        <ProductCard key={item.id} item={item} />
      ))}
    </div>
  )
}
