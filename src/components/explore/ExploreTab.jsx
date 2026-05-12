import ClimateWidget from "./ClimateWidget";
import CountryWidget from "./CountryWidget";
import FoodWidget from "./FoodWidget";

/**
 * ExploreTab
 * Mounted when the user clicks the "Explore" tab on the results page.
 * Layout:
 *   - Desktop: 2 columns. Climate + Country side-by-side on top, Food full-width below.
 *   - Mobile: stacked.
 */
export default function ExploreTab({ destination }) {
  return (
    <section className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <ClimateWidget destination={destination} />
        <CountryWidget destination={destination} />
      </div>
      <FoodWidget destination={destination} />
    </section>
  );
}
