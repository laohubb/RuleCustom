/*
README：https://github.com/yichahucha/surge/tree/master
每日打卡提醒（corn "0 9,18 * * 1-5" 周一到周五，早九晚六）+ 每日壹句（有道词典）+ 跳转钉钉打卡页面（下拉通知点击链接）
*/

const $tool = new tool()
$tool.get('https://dict.youdao.com/infoline/style/cardList?mode=publish&client=mobile&style=daily&size=2', function (error, response, data) {
    let obj = JSON.parse(data);
    let date = new Date();
    let isAM = date.getHours() < 12 ? true : false;
    let title = 'Clock' + (isAM ? ' in' : ' out') + (isAM ? ' ' : ' ');
    let subtitle = '';
    let content = 'shortcuts://run-shortcut?name=Check%20in';
    if (!error) {
        if (obj && obj.length > 1) {
            let yi = obj[1];
            content = yi.title + '\n' + yi.summary + '\n\n' + content;
        }
    }
    $tool.notify(title, subtitle, content);
    $done();
})

function tool() {
    this.isSurge = typeof $httpClient != "undefined"
    this.isQuanX = typeof $task != "undefined"
    this.isResponse = typeof $response != "undefined"
    const node = (() => {
        if (typeof require == "function") {
            const request = require('request')
            return ({ request })
        } else {
            return (null)
        }
    })()
    this.notify = (title, subtitle, message) => {
        if (this.isQuanX) $notify(title, subtitle, message)
        if (this.isSurge) $notification.post(title, subtitle, message)
        if (node) console.log(JSON.stringify({ title, subtitle, message }));
    }
    this.write = (value, key) => {
        if (this.isQuanX) return $prefs.setValueForKey(value, key)
        if (this.isSurge) return $persistentStore.write(value, key)
    }
    this.read = (key) => {
        if (this.isQuanX) return $prefs.valueForKey(key)
        if (this.isSurge) return $persistentStore.read(key)
    }
    const adapterStatus = (response) => {
        if (response) {
            if (response.status) {
                response["statusCode"] = response.status
            } else if (response.statusCode) {
                response["status"] = response.statusCode
            }
        }
        return response
    }
    this.get = (options, callback) => {
        if (this.isQuanX) {
            if (typeof options == "string") options = { url: options }
            options["method"] = "GET"
            $task.fetch(options).then(response => { callback(null, adapterStatus(response), response.body) }, reason => callback(reason.error, null, null))
        }
        if (this.isSurge) $httpClient.get(options, (error, response, body) => { callback(error, adapterStatus(response), body) })
        if (node) node.request(options, (error, response, body) => { callback(error, adapterStatus(response), body) })
    }
    this.post = (options, callback) => {
        if (this.isQuanX) {
            if (typeof options == "string") options = { url: options }
            options["method"] = "POST"
            $task.fetch(options).then(response => { callback(null, adapterStatus(response), response.body) }, reason => callback(reason.error, null, null))
        }
        if (this.isSurge) $httpClient.post(options, (error, response, body) => { callback(error, adapterStatus(response), body) })
        if (node) node.request.post(options, (error, response, body) => { callback(error, adapterStatus(response), body) })
    }
}
