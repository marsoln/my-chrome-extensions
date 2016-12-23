import $ from 'jquery'
import concatUrl from './concatUrl'
import { CARD_TYPE, CATEGORY } from './enum'

let cardInfo = [] // 卡券信息

const DO_QUERY = function(opt) {
    let url = concatUrl('http://a.jd.com/coupons.html', opt)
    return $.get(url)
        .then(html => {
            if (html) {
                let $items = $(html).find('.quan-item')
                if ($items && $items.length > 0) { // 获取页面上的券
                    $items.each((i, o) => {
                        try {
                            if (o) {
                                let $tar = $(o)
                                if (!$tar.find('.btn-state.btn-getend')[0]) { // 过滤掉抢完的券
                                    let discount = parseInt($tar.find('.num').text()) // 折扣值
                                    let limitText = $tar.find('.limit span').text().match(/\d+/) // 条件限度
                                    if (limitText) {
                                        let limit = +limitText[0]
                                        let title = $tar.find('.q-range p').text() // 使用范围
                                        let key = $tar.data('key')
                                        let discountRate = discount / limit
                                        cardInfo.push({
                                            discountRate,
                                            discount,
                                            limit,
                                            url,
                                            title,
                                            key
                                        })
                                    }
                                }
                            }
                        } catch (e) {
                            console.log(e)
                        }
                    })
                }
            }
        })
        .fail(err => {
            console.log(err)
        })
}

$(function() {
    let $exec = $('#exec')
    let onExec = false
    $exec.text('试试手气')
    let $cardType = $('#cardType')
    let $category = $('#category')

    for (let k in CARD_TYPE) {
        let $op = $('<option></option>')
        $cardType.append($op)
        $op.val(CARD_TYPE[k])
        $op.text(k)
    }

    for (let k in CATEGORY) {
        let $op = $('<option></option>')
        $category.append($op)
        $op.val(CATEGORY[k])
        $op.text(k)
    }

    // $exec.on('click', function() {
    //     if (onExec)
    //         return
    //     onExec = true
    //     let crawledPageAmount = $('#crawledPageAmount').val() // 抓取页数
    //     let resultAmount = $('#resultAmount').val() // 显示的结果数量
    //     let minDiscountAmount = $('#minDiscountAmount').val() // 最小折扣力度
    //     let category = $category.val()
    //     let cardType = $cardType.val()

    //     let crawlData = function() {
    //         let _page = 1
    //         let promArr = []
    //         for (; _page <= crawledPageAmount; _page++) {
    //             promArr.push(
    //                 DO_QUERY({
    //                     page: _page,
    //                     ct: cardType,
    //                     cat: category
    //                 })
    //             )
    //         }
    //         return promArr
    //     }


    //     Promise
    //         .all(crawlData())
    //         .then(() => {
    //             let info = cardInfo.filter(c => {
    //                 return c.discount >= minDiscountAmount
    //             })
    //             info.sort((p, n) => {
    //                 return n.discountRate - p.discountRate
    //             })

    //             let result = info.slice(0, resultAmount)
    //             $('.result').html(JSON.stringify(result))

    //             // result.forEach(t => {
    //             //     $.ajax({
    //             //         headers: {
    //             //             Accept: 'application/json, text/javascript, */*; q=0.01',
    //             //             Referer: t.url
    //             //         },
    //             //         type: 'get',
    //             //         url: concatUrl('http://a.jd.com/ajax/freeGetCoupon.html', {
    //             //             key: t.key,
    //             //             r: Math.random()
    //             //         })
    //             //     })
    //             // })

    //             onExec = false
    //         }).catch(err => {
    //             onExec = false
    //             console.log(err)
    //         })

    // })

    $exec.on('click', function() {
        if (onExec)
            return
        onExec = true
        $exec.text('查询中')
        let crawledPageAmount = $('#crawledPageAmount').val() // 抓取页数
        let resultAmount = $('#resultAmount').val() // 显示的结果数量
        let minDiscountAmount = $('#minDiscountAmount').val() // 最小折扣力度
        let category = $category.val()
        let cardType = $cardType.val()

        let crawlData = function() {
            let _page = 1
            let promArr = []
            for (; _page <= crawledPageAmount; _page++) {
                promArr.push(
                    DO_QUERY({
                        page: _page,
                        ct: cardType,
                        cat: category
                    }).then(() => {
                        let info = cardInfo.filter(c => parseInt(c.discount) >= parseInt(minDiscountAmount))
                        info.sort((p, n) => {
                            return n.discountRate - p.discountRate
                        })
                        let result = info.slice(0, resultAmount)
                            // console.log(info)
                            // console.log(result)
                        let $res = $('.result')
                        $res.empty()
                        result.forEach(i => {
                            let $item = $(`<li><span class="discountRate">折扣率: ${i.discountRate}</span><span class="discount">折扣额度: ${i.discount}</span><span class="limit">折扣限制: ${i.limit}</span><span class="title">说明: ${i.title}</span><a class="link" href="${i.url}">卡券链接</a></li>`)
                            $res.append($item)
                        })
                    })
                )
            }
            return promArr
        }


        Promise
            .all(crawlData())
            .then(() => {
                onExec = false
                $exec.text('试试手气')
            }).catch(err => {
                onExec = false
                $exec.text('试试手气')
            })

    })
})
