const medicine_news_base_url = 'http://drv888.com/index.php//medicine_news/p'
const medicine_news_urls = []

let dir = `${basePath}/medicine_news_i`
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir)
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main()

async function main() {
  for (let i = 1; i <= 9; i++) {
    // medicine_news_urls.push(`${medicine_news_base_url}/${i}`)
    await queryPage(`${medicine_news_base_url}/${i}`)
    await sleep(5000)
  }
}

async function queryPage (pageUrl) {
  await rp({
    uri: pageUrl,
    transform: function (body) {
      return cheerio.load(body)
    }
  }).then(($) => {
    $('.news_box li a').each(function () {
      console.log($(this).attr('href'))
      crawlContent($(this).attr('href'), $(this).find('img').attr('src'))
    })
  }).catch((err) => {
    console.log(err)
  })
}

async function download (uri, filename) {
  return new Promise((resolve) => {
    request.head(uri, function(err, res, body) {
      request(uri).pipe(fs.createWriteStream(filename)).on('close', resolve)
    })
  })
}

function parseBgStyle (cssBgStyle) {
  const regex = /(["'])(\\?.)*?\1/g;
  let m = regex.exec(cssBgStyle)
  return m[0].substr(1, m[0].length - 2)
}

async function crawlContent (url, imageUrl) {
  await rp({
    uri: url,
    transform: function (body) {
      return cheerio.load(body)
    }
  }).then(async ($) => {
    let title = $('.inner_box.view h1').text()
    let dir = `${basePath}/medicine_news_i/${title}`
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
    let html = $('.inner_box.view').html()
    fs.writeFileSync(`${basePath}/medicine_news_i/${title}/content.html`, html)
    let ext = path.extname(imageUrl)
    await download(imageUrl, `${basePath}/medicine_news_i/${title}/cover${ext}`)
  })
}