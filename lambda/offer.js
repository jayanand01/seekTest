const fs = require('fs')
let response, total;

// data.json is the data source of the offers. In real world it should come from API world. For simplicity of the solution, we are reading this data from a json file.
const {items, customerOffers} = JSON.parse(fs.readFileSync('./data.json'))

const CLASSIC = 'classic'
const STANDOUT = 'standout'
const PREMIUM = 'premium'

exports.offerHandler = async (event, context) => {

    // The json data is being passed in the body of the lambda request. Format - "classic, standout, premium"
    const { customer, itemList } = event.body && JSON.parse(event.body) || {};

    try {
        if (!itemList) {
            return response = {
                'statusCode': 404,
                'body': JSON.stringify({
                    error: 'Offers missing'
                })
            }
        }
        
        const offers  = itemList.split(",").map(item => item.trim());
        const customerNotFound = !customerOffers.some(mapper => mapper.customer === customer)
        
        if (!customer || customerNotFound) {
            // Default customer or customer not Found in Offers - simple logic of offer addition for total cost
            total = offers.reduce((partialSum, a) => {
                const item = items.find(item => item.itemType === a)
                return partialSum + item.price
            }, 0);
        } else {
            // Customer Found in Offers DB- logic to calculate the total pricing

            const prices = customerOffers.find(mapper => mapper.customer === customer)
            // Deserialize the JSON data.
            const {bundleClassic, singleClassic, bundleStandOut, singleStandOut, bundlePremium, singlePremium, priceForBundleClassicAds, priceForClassicAds, priceForBundleStandOutAds, priceForStandOutAds, priceForBundlePremiumAds, priceForPremiumAds} = prices || {};

            // Extract all offer types from the JSON passed in request body
            const classicOffers = offers.filter(offer => offer === CLASSIC);
            const standOutOffers = offers.filter(offer => offer === STANDOUT);
            const premiumOffers = offers.filter(offer => offer === PREMIUM);
            
            // Console logs to understand the logic below
            // console.log(customer, bundleClassic, bundleStandOut, bundlePremium, singleClassic, eval(singleClassic), eval(bundleClassic), eval(bundleStandOut), eval(bundlePremium), classicOffers, standOutOffers, premiumOffers, priceForBundleStandOutAds)

            // Get Individual offer type accumulative costs and add them to get a total one.
            const totalClassicPrice = bundleClassic !== "0"
            ? 
                eval(bundleClassic) * priceForBundleClassicAds + eval(singleClassic) * priceForClassicAds
            :
                classicOffers.length * priceForClassicAds;

            const totalStandOutPrice = bundleStandOut !== "0"
            ? 
                eval(bundleStandOut) * priceForBundleStandOutAds + eval(singleStandOut) * priceForStandOutAds
            :
                standOutOffers.length * priceForStandOutAds;
                    
            const totalPremiumPrice = bundlePremium !== "0"
            ? 
                eval(bundlePremium) * priceForBundlePremiumAds + eval(singlePremium) * priceForPremiumAds
            :
                premiumOffers.length * priceForPremiumAds;
            
            // Console logs to get the total
            // console.log(totalClassicPrice, totalPremiumPrice, totalStandOutPrice)
        
            total = totalClassicPrice + totalPremiumPrice + totalStandOutPrice
        }

        response = {
            'statusCode': 200,
            'body': JSON.stringify({
                total: total
            })
        }
    } catch (err) {
        // The error message hardcoded below can be moved from here to some other files or services.It has been used here for demo purpose.
        response = {
            'statusCode': 404,
            'body': JSON.stringify({
                error: err.message || "Server Error"
            })
        }
    }

    return response
};
