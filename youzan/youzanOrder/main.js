let $logger = $('#logger'), // 日志容器
    $orders = $('#orders'), // 订单容器
    seperator = '\n', // 分隔符
    onExec = false // 执行状态标识

// 记录日志
let log = function(logInfo) {
    $logger.append(`${logInfo}<br/>`)
}

// 清空日志
let clearLog = () => {
    $logger.text('')
}

// 提示内容
let notice = (info) => {
    $('.notice').remove()
    let $noticer = $('<div></div>')
    $noticer.addClass('notice').text(info)
    $(document.body).append($noticer)
    $noticer.animate({ top: '8rem' }, 100).fadeOut(2500, () => {
        $noticer.remove()
    })
}

// 日志复制
$logger
    .on('click', () => {
        let tar = $logger[0];
        tar.focus()
        tar.setSelectionRange(0, $logger.val().length)
        if (document.execCommand('copy')) {
            tar.blur()
            notice('日志复制成功.')
        }
    })

// 执行操作
$('#exec')
    .on('click', () => {
        if (onExec) {
            notice('当前任务正在执行中,请等待...')
            return
        } else {
            let orderStr = $orders.val()
            let orderArr = orderStr.split(seperator).filter(t => !!t)
            if (orderStr.length == 0 || orderArr.length == 0) {
                notice('请粘贴订单号.')
                return
            } else {
                clearLog() // 清空日志记录
                onExec = true // 将执行状态置为true
                let failOrders = []
                let counter = 0
                let promises = []

                orderArr.forEach(order => {
                    promises.push(
                        new Promise((resolve) => {
                            $.ajax({
                                    url: 'https://koudaitong.com/v2/trade/order/list.json',
                                    data: {
                                        'keyword[order_no]': order,
                                        p: 1,
                                        type: 'all',
                                        state: 'all',
                                        orderby: 'book_time',
                                        tuanId: '',
                                        order: 'desc',
                                        page_size: 20,
                                        disable_express_type: '',
                                        order_label: 'order_no',
                                        feedback: 'all',
                                        buy_way: 'all',
                                        express_type: 'all',
                                    }
                                })
                                .then(res => {
                                    if (res.code == 0 && res.msg == 'success') {
                                        // 订单查询到的列表
                                        if (res.data.list && res.data.list.length > 0) {
                                            res.data.list.forEach(l => {
                                                if (l.items && l.items.length > 0) {
                                                    $.ajax({
                                                            type: 'POST',
                                                            url: 'https://koudaitong.com/v2/trade/order/express.json',
                                                            data: {
                                                                order_no: order,
                                                                no_express: 1,
                                                                express_id: '',
                                                                express_name: '',
                                                                express_no: '',
                                                                item_ids: l.items.map(i => i.id),
                                                                allowNoExpressSend: true
                                                            }
                                                        })
                                                        .then(() => {
                                                            resolve()
                                                        })
                                                        .fail(() => {
                                                            failOrders.push(order)
                                                            log(`订单${order}发货提交失败.`)
                                                            resolve()
                                                        })
                                                }
                                            })
                                        } else {
                                            failOrders.push(order)
                                            log(`没有对应的订单${order}.`)
                                            resolve()
                                        }
                                    } else {
                                        failOrders.push(order)
                                        log(`订单${order}查询错误:${res.msg}.`)
                                        resolve()
                                    }
                                })
                                .fail(err => {
                                    failOrders.push(order)
                                    log(`查询订单${order},请求失败.`)
                                    resolve()
                                })
                        })
                    )
                })

                Promise.all(promises).then(() => {
                    notice(`执行完毕,失败${failOrders.length}个订单.`)
                    if (failOrders.length > 0) {
                        log('失败订单号:')
                        failOrders.forEach(o => {
                            log(o)
                        })
                    }
                    onExec = false
                })

            }
        }
    })