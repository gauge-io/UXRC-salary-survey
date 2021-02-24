#UXRC Salary Survey

As a part of the UXRConference, we thought it would be interesting to perform a secondary set of analysis on data collected from two thousand respondents of the UXRC Salary Survey.

##Goals

Our goals for this project was to put ourselves in the mindset of our fellow researcher, who might be able to use this analysis tool to help justify a raise, promotion as well as perhaps to move to a different city or employer. Building in this context helped us prioritize and design visualizations and features to help accommodate these needs.


##Cleaning Data

They say that 80% of a data scientist's job is cleaning data, with 20% actually analyzing it. That wasn't quite accurate in our case, but there was quite a bit of restructuring and normalizing that needed to be done before we began trying to visualize it.
One thing I appreciated about the way that UXRC authored the survey is that it left room for personal privacy and individual interpretation on some of the standard responses. Fields like Industry, Education Level and Company Type were select menus with the ability to provide an open input. This initially gave a great deal of range to the responses. For anyone who is unfortunate enough to know about NAICS, how we as a country define our careers and industry is decades out of date. That's our punishment for changing our job titles every couple of months, I guess.

Sample of the guessing game in normalizing open inputs of Company Type and Industry FieldsNormalizing Industries and Company Type was a guessing game at best. For example, FinTech companies could easily be defined as either - and it seems as if everyone is a technology company these days in one manner or the other. Nonetheless, we whittled down from 162 unique Industries into a more manageable list of 26. Our goal was to have some definable dimension for which to compare against, but there were no winners in this normalization, only losers.

Another major data transformation was with regards to city. One shortcoming of survey tools is their lack of location lookup. Meaning, that if you want to put Whooville as your place of residence (its just outside of Topeka), there are typically no off-the-shelf survey tools that will correct you. These types of services tend to be reserved for e-commerce, not UX research. Coupling with this scenario, there was no mandatory City / State field in our survey. Just a country was fine. This did throw off some of our rendering, in that our Lat/Long lookups of just a country resulted in the Geographic center of the country. USA has an unusual number of Coffeyville, Kansas listings, with a UXR hot spot suddenly displaying in the Northern Territories of Canada.

As such, we had some vague references to city or neighborhood of residence (I'm looking at you, Park Slope, Brooklyn, NYC, NY) that needed to be resolved if we were going to apply mapping coordinates through latitude and longitude. A Google Places API took these open input strings and resolve them with both a standard hierarchy of place (as each country's definition of what a neighborhood differs). Lat / Long coordinates are a must if you are to do any mapping or geocoding.
Locality, township, prefecture or neighborhood. It's all Jersey, baby.Another goal in the analysis was to group the respondents by metropolitan area. We felt that this distinction was a better way to compare different parts of the country to one another, rather than splitting hairs between the San Josés, Santa Claras and Sunnyvales of the world. This clustering is a process applied by the U.S. Census - and each country has their own approach to this process. In the analysis, you'll see this metropolitan clustering applied to the US only, whereas the International cities as standalone entities.

##Envisioning Structure

As stated in our Goals, we wanted to visualize similar respondents so that they might be able to point to the UXR community to better reference what they should be paid, according to their Experience Level, Industry and Education. These values were chosen as persistent filters that will allow them to drill down to their comparative dimension.

##Compensation Box-Plots

We're referencing similar cost-of-living comparisons from popular print publications, articles that suggest the implications of moving from one metropolitan area of the country to another. Our analysis sought to show the top and bottom quintiles, as just stating the average is too vague of a metric for which to compare by. The box-plot method was perfect to show the distribution of this range as well as an average. We took the step of looking up and merging Cost of Living Indices from both domestic and international lists to help adjust some of the numbers from city-to-city.

As the average compensation is significantly higher, It pays to be educated in San José,The great thing about our structured data was that we could retain the factors of Education, Experience Level, Team Size and Company Type were useful in being able to show a secondary level breakdown of what was driving the numbers per city or metropolitan area. The more finite of a view the user can draw, the more accurately they could compare to their own scenario.

##Commutation Geography

Another theme for 2020 has been transience and migration. We are all adapting to this pandemic in our own way, and many have used this twist of fate to relocate their primary residence. In the survey itself, we asked whether or not the participant resided in the same city as their employer. We took this as a binary True / False, whether it be in the next city over or across to the other side of the world. We all commute in different ways.
Remote work stemming from the East Coast of the USA.As we performed a Lat/Long lookup for each of the participant's home cities, we did the same for each of the stated office locations. This gave us an ability to show the cities in the world that money flowed to and from. The visualization references the amount of compensation by the thickness of the lines, which is also compiling the number of respondents cities in their individual. The size of the nodes indicate the number of respondents, by city. If they've flagged they're commuting, we connected them to their office location and sized their connector by salary compensation.

##Correlation Matrix

Our last view was the perspective of salary amounts against the total compensation package. Roughly 55% of the respondents did receive some form of additional compensation other than their salary, and we wanted to show this correlation. As the only two Cardinal data values in our survey set, we chose to keep the factors of Company Type, Education, Experience, etc. as filtering factors.

##Reflections and Analysis

Kyle Osborne has already done some great analysis on UXRSurvey.com from this same dataset, and some of these findings echo Kyle's work as well.

• Emerging remote hubs of UXR work - the major cities of Chicago, New York, Austin, San Francisco and Boston are, predictably, active centers of remote working. European hubs centered around London, Amsterdam and Finland. Two-thirds of all recipients stated that they don't live in the same city as their employer, a trend that will likely grow in a post-pandemic world.

• Remote work pays better - averaged across all Experience Levels, Industries and Company Types, self-identified commuters earn 15% more than those who have stated they work in the same town. Professional Services and Software were the two biggest categories both in total respondents, as well as stated percentage of remote working (~65%).

• Discrepant industries - the industries that paid the most were Arts, Entertainment and Recreation (which was coded to include Social Media), as well as Manufacturing and Travel. Across all respondents and all experience level, these industries pay around 40% over average.

• Go back to school – the average salary for a Ph.D. was 125k, nearly 30k more than just a Bachelor's degree and more13k more than a Masters degree. Leveling up your career through formal education pays dividends.

##Acknowledgements

Thanks to fellow Canadians, Alec Levin and Rebecca Levin, Kyle Osborne and the rest of UXRC for sponsoring this initiative and helping me get up and running with the dataset. A thousand thank yous to Ashish Singh and Viktor Strelianyi for your help with on development side of the coin.
Please do fork our repo if you'd like to further this visualization set, and we'd love to hear back from you on where you think the value in the data might lie.
