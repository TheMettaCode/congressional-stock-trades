//var PORT = 8000;
var axios = require('axios');
var cheerio = require('cheerio');
var express = require('express');

// const app = express();
const router = express.Router();

async function getData(url) {
  try {
    let res = await axios({
      url: url,
      method: 'get',
      timeout: 8000,
      headers: {
        'Content-Type': 'application/json',
      }
    })
    if (res.status == 200) {
      // test for status you want, etc
      console.log("Status: " + res.status)
    }
    // Don't forget to return something   
    return res.data
  }
  catch (err) {
    console.error(err);
  }
}

router.get('/senate', (req, res) => {
  const senateTradesList = [];
  const senateSource = {
    name: 'Senate Stock Disclosures',
    address: 'https://sec.report/Senate-Stock-Disclosures',
    base: 'https://sec.report',
    slug: 'senate',
  };

  console.log(senateSource);
  getData(senateSource.address)
    .then(responseData => {
      const html = responseData;
      // console.log("::" + html);
      const $ = cheerio.load(html);

      const senateMap = { "api": "Congressional Stock Trades by MettaCode Developers", "chamber": "senate", "retrieved": Date() };

      const transactions = $('tbody').find('tr');

      transactions.each((index, tAction) => {

        const thisTradeItem = {};

        if (index % 2 == 0) {

          thisTradeItem["filed-date"] = $(tAction).find('td').first().find('div').first().text();
          thisTradeItem["transaction-date"] = $(tAction).find('td').first().find('div').last().text();
          thisTradeItem["ticker"] = $(tAction).find('a:nth-child(2)').text();
          thisTradeItem["company"] = $(tAction).find('a').first().text().trim();
          thisTradeItem["company-url"] = ''; // senateSource.base + $(tAction).find('a').first().attr('href');
          thisTradeItem["member"] = 'Sen. ' + $(tAction).find('.ov').find('a').text().trim();
          thisTradeItem["owner"] = $(tAction).next().find('div').last().text();
          thisTradeItem["filings"] = ''; // senateSource.base + $(tAction).find('.ov').find('a').attr('href');
          thisTradeItem["disclosure-id"] = $(tAction).next().find('a').first().text();
          thisTradeItem["disclosure-link"] = senateSource.base + $(tAction).next().find('a').first().attr('href');
          thisTradeItem["trade-type"] = $(tAction).next().find('div').first().text();
          thisTradeItem["trade-range"] = $(tAction).next().find('td:nth-child(2)').first().text();
          thisTradeItem["data-retrieved"] = Date().toString();
          thisTradeItem["data-retrieved-by"] = "MettaCode Developers";

          // console.log(thisTradeItem);
          senateTradesList.push(thisTradeItem);
        }

      });
      // console.log(senateTradesList);
      senateMap["retreived-trade-count"] = senateTradesList.length;
      senateMap["senate-trades"] = senateTradesList;
      res.json(senateMap);
    });
});

router.get('/house', (req, res) => {
  const houseTradesList = [];
  const houseSource =
  {
    name: 'House Stock Disclosures',
    address: 'https://house-stock-watcher-data.s3-us-west-2.amazonaws.com/data/all_transactions.json',
    base: '',
    slug: 'house',
  };
  console.log(houseSource);

  getData(houseSource.address)
    .then((responseData) => {
      const transactions = responseData;
      transactions.sort((a, b) => new Date(b['transaction_date']) - new Date(a['transaction_date']));
      const originalHouseTradesList = transactions.slice(0, 200);
      const filteredList = originalHouseTradesList.filter((value) => new Date(value['transaction_date']) <= new Date());

      const houseMap = { "api": "Congressional Stock Trades by MettaCode Developers", "chamber": "house", "retrieved": Date() };

      for (var item of filteredList) {
        const thisTradeItem = {};
        thisTradeItem["filed-date"] = item['disclosure_date'].split('/')[2] + '-' + item['disclosure_date'].split('/')[0] + '-' + item['disclosure_date'].split('/')[1];
        thisTradeItem["transaction-date"] = item['transaction_date'];
        thisTradeItem["ticker"] = item['ticker'];
        thisTradeItem["company"] = item['asset_description'];
        thisTradeItem["company-url"] = '';
        thisTradeItem["member"] = item['representative'];
        thisTradeItem["owner"] = item['owner'] ?? '';
        thisTradeItem["filings"] = '';
        thisTradeItem["disclosure-id"] = '';
        thisTradeItem["disclosure-link"] = item['ptr_link'];
        thisTradeItem["trade-type"] = item['type'];
        thisTradeItem["trade-range"] = item['amount'];
        thisTradeItem["data-retrieved"] = Date().toString();
        thisTradeItem["data-retrieved-by"] = "MettaCode Developers";

        houseTradesList.push(thisTradeItem);
      };

      // console.log(houseTradesList);
      houseMap["retreived-trade-count"] = houseTradesList.length;
      houseMap["house-trades"] = houseTradesList;
      res.json(houseMap);
    });
});

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'US Congress Stock Trade API' });
});


module.exports = router;

//app.listen(PORT, () => console.log(`server running on PORT ${PORT}`));