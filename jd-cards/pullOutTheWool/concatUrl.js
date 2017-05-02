export default function(str, params) {
    // 参数不为对象 或 参数为空对象 返回原字符串
    if (!(params instanceof Object) || Object.keys(params).length === 0)
        return str
    let matchReg = /([\?&][^#?&=]*=?[^#?&]*)+/ig,
        anchorReg = /#[^?]*/ig,
        anchorMatches = str.match(anchorReg),
        temp = str,
        matches = temp.match(matchReg),
        matchStr = matches ? matches[0] : undefined,
        newParams = {},
        action = temp.substr(0, temp.length - (matchStr ? matchStr.length : 0) - (anchorMatches ? anchorMatches[0].length : 0))

    if (matchStr) {
        // 拆出参数数组
        let arr = matchStr.substr(1).split(/[?=&]/g),
            i = 0
        while (i < arr.length) {
            newParams[arr[i]] = i + 1 < arr.length ? arr[i + 1] : undefined
            i += 2
        }
    }

    // 如果同名参数有了值则覆盖
    Object.assign(newParams, params)
    temp = Object.keys(newParams).reduce((p, n) => {
        if (typeof newParams[n] !== 'undefined')
            p += `${n}=${newParams[n]}&`
        return p
    }, `${action}?`)

    return encodeURI(temp.substr(0, temp.length - 1) + (anchorMatches ? anchorMatches[0] : ''))
}