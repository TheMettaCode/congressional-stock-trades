var PORT = 8000;
var axios = require('axios');
var cheerio = require('cheerio');
var express = require('express');

const app = express();
const router = express.Router();

const sources = [
  {
    name: 'Senate Stock Disclosures',
    address: 'https://sec.report/Senate-Stock-Disclosures',
    base: 'https://sec.report',
    slug: 'senate',
  },
]

const tradesList = [];

sources.forEach(source => {
  //    console.log(sources)
  if (source.slug == 'senate') {
    console.log(sources);

    axios.get(source.address)
      .then(response => {
        const html = response.data;
        const $ = cheerio.load(html);

        const transactions = $('tbody').find('tr');

        transactions.each((index, tAction) => {

          const thisTradeItem = {};

          if (index % 2 == 0) {

            thisTradeItem["filedDate"] = $(tAction).find('td').first().find('div').first().text();
            thisTradeItem["transactionDate"] = $(tAction).find('td').first().find('div').last().text();
            thisTradeItem["ticker"] = $(tAction).find('a:nth-child(2)').text();
            thisTradeItem["company"] = $(tAction).find('a').first().text().trim();
            thisTradeItem["companyUrl"] = source.base + $(tAction).find('a').first().attr('href');
            thisTradeItem["senator"] = $(tAction).find('.ov').find('a').text().trim();
            thisTradeItem["owner"] = $(tAction).next().find('div').last().text();
            thisTradeItem["filingsUrl"] = source.base + $(tAction).find('.ov').find('a').attr('href');
            thisTradeItem["disclosureId"] = $(tAction).next().find('a').first().text();
            thisTradeItem["disclosureLink"] = source.base + $(tAction).next().find('a').first().attr('href');
            thisTradeItem["type"] = $(tAction).next().find('div').first().text();
            thisTradeItem["tradeAmount"] = $(tAction).next().find('td:nth-child(2)').first().text();

            // console.log(thisTradeItem);
            tradesList.push(thisTradeItem);
          }

        });
      });
  } else if (sources.slug == 'house') {
    console.log('SOURCE SELECTED IS HOUSE... TBD');
  } else {
    console.log('NO SOURCE FOUND');
  }

});

console.log('COUNT OF TRADES:' + tradesList.length);

router.get('/senate', (req, res) => {
  console.log(tradesList);
  res.json(tradesList);
});

router.get('/house', (req, res) => {
  res.render('no-page', { title: 'House trades coming soon...' });
});

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'US Congress Stock Trade API' });
});


module.exports = router;

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`));