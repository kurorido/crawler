const rp = require('request-promise')
const request = require('request')
const cheerio = require('cheerio')
const fs = require('fs')
const path = require('path')
const slugify = require('slugify')
const basePath = '/Users/rolichung/digitalagent/crawler'
import { sleep } from './utils.js'

const case_news_base_url = 'http://drv888.com/index.php//caseshare/p/'
const case_news_urls = []

let dir = `${basePath}/cases`
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir)
}

main()

async function main() {
  for (let i = 1; i <= 2; i++) {
    // medicine_news_urls.push(`${medicine_news_base_url}/${i}`)
    await queryPage(`${case_news_base_url}/${i}`)
    await sleep(5000)
  }
}

async function download (uri, filename) {
  return new Promise((resolve) => {
    request.head(uri, function(err, res, body) {
      request(uri).pipe(fs.createWriteStream(filename)).on('close', resolve)
    })
  })
}

async function queryPage (pageUrl) {
  await rp({
    uri: pageUrl,
    transform: function (body) {
      return cheerio.load(body)
    }
  }).then(($) => {
    $('.case_box li a').each(function () {
      console.log($(this).attr('href'))
      crawlContent($(this).attr('href'), $(this).find('img').attr('src'))
    })
  }).catch((err) => {
    console.log(err)
  })
}

async function crawlContent (url, imageUrl) {
  await rp({
    uri: url,
    transform: function (body) {
      return cheerio.load(body)
    }
  }).then(async ($) => {
    let title = slugify($('.inner_box.view h1').text())
    let dir = `${basePath}/cases/${title}`
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
    let html = $('.inner_box.view').html()
    fs.writeFileSync(`${basePath}/cases/${title}/content.html`, html)
    let ext = path.extname(imageUrl)
    await download(imageUrl, `${basePath}/cases/${title}/cover${ext}`)
  })
}