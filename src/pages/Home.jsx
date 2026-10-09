import RentalHero from '../components/RentalHero'
import RentalSections from '../components/RentalSections'
import FeaturedCars from '../components/FeaturedCars'
import './home.css'

export default function HomePage() {
  return (
    <main className="rental-home">
      <RentalHero />
      <FeaturedCars />
      <RentalSections />
    </main>
  )
}
