// @ts-nocheck
import ExcelJS from 'exceljs'

/**
 * 
 * @param {Array} dataList 导出数据
 * @param {String} fileName 文件名
 * @param {Number} fontSize 字体大小(默认12)
 * @param {String} fontColor 字体颜色(默认FF000000)
 * @param {Number} colWidth 列宽(默认25)
 * @returns 导出xlsx文件
 */
export const exportXlsx = async ({ dataList, fileName, fontSize = 12, fontColor = 'FF000000', colWidth = 25 }) => {
    if (!dataList || !fileName) {
        throw new Error('导出数据和文件名称不能为空')
    }

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Sheet3')

    // 遍历数组生成列标题&数据映射key
    const newList = []
    for (let key in dataList[0]) {
        newList.push({ header: key, key, width: colWidth })
    }

    // 设置key信息
    worksheet.columns = newList

    // 添加数据到工作表
    worksheet.addRows(dataList)

    // 设置第一行加粗&所有单元格居中对齐&字体为微软雅黑&
    for (let i = 1; i <= worksheet.rowCount; i++) {
        worksheet.getRow(i).font = { name: '微软雅黑', bold: i === 1 ? true : false, size: fontSize, color: { argb: fontColor } }
        worksheet.getRow(i).alignment = { horizontal: 'center', vertical: 'middle' }
    }

    // 导出 Excel 文件
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/octet-stream' })
    const link = document.createElement('a')
    const fileNameWithDate = `${fileName}.xlsx`

    // 创建下载链接并触发下载
    link.href = URL.createObjectURL(blob)
    link.download = fileNameWithDate
    link.click()
}
