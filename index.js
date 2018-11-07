//依赖模块
const fs = require('fs');
const request = require("request");
const cheerio = require("cheerio");
const mkdirp = require('mkdirp');
const host = 'http://www.qupu123.com';

const dir = './images';

//创建目录
mkdirp(dir, function (err) {
    if (err) {
        console.log(err);
    }
});

/**
 *
 *
 * @param {string} url 受访页面url
 */
function requestUrl(url){
    return new Promise((resolve, reject) => {
        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(body);
            } else {
                reject('获取页面失败');
            }
        });
    })
}

/**
 *
 *
 * @param {htmldom} data 获取列表数据
 * @returns
 */
function getListPages(data){
    return new Promise((resolve, reject) => {
        const currectPages = [];
        const $ = cheerio.load(data);
        const dom = $('.opern_list .f1 a');
        for (const key in dom) {
            if (dom.hasOwnProperty(key)) {
                const element = dom[key];
                element.attribs && currectPages.push(`${host}${element.attribs.href}`)
            }
        }

        setTimeout(() => {
            resolve(currectPages);
        }, 100);
    })
}

/**
 *
 *
 * @param {htmldom} data 获取详细页面数据
 * @returns
 */
function getPages(data){
    return new Promise((resolve, reject) => {
        const currectData = [];
        const $ = cheerio.load(data);
        const dom = $('.imageList a');

        for (const key in dom) {
            if (dom.hasOwnProperty(key)) {
                const element = dom[key];
                element.attribs && currectData.push({
                    title: `s${key}${element.attribs.title}`,
                    url: `${host}${element.attribs.href}`
                })
            }
        }
        
        setTimeout(() => {
            resolve(currectData);
        }, 100);
    })
}

function loopList() {
    
}

async function getdate(id) {
    const body = await requestUrl(`${host}/qiyue/dixiao/${id}.html`);
    const listdata = await getListPages(body);
    let index = 0
    let downLoadList = [];
    listdata.forEach(async element => {
        const pagebody = await requestUrl(element);
        const data = await getPages(pagebody);
        downLoadList = downLoadList.concat(data);
    });

    setTimeout(() => {
        function loopData (){
            const optData = downLoadList[index];
            downLoad(optData.url, optData.title)
                .then(() => {
                    if (index < downLoadList.length) {
                        loopData();
                    }
                    index++;
                })
                .catch((err) => {
                    console.log(err);
                    if (index < downLoadList.length) {
                        loopData();
                    }
                    index++;
                })
        }
        loopData();
    }, 3000);
}



function downLoad(url, title) {
    const filename = title.split('(1)')[0];
    const type = title.substr(-3, 3);
    return new Promise((resolve, reject) => {
        if (title.indexOf('五线谱') !== -1) {
            reject('五线谱不下载');
            return;
        }
        request
        .head(url, function (err, res, body) {
            if (!err) {
                request(url).pipe(fs.createWriteStream(`${dir}/${filename}.${type}`));
                setTimeout(() => {
                    console.log(filename, '下载成功！');
                    resolve();
                }, 1000);
            } else {
                reject('下载失败');
            }
        });
    })
};


// 从列表开始采集
getdate(2);

return;
