// @ts-nocheck
'use client'

import React, { Fragment, useEffect, useState } from 'react'
import dayjs from 'dayjs'
import axios from 'axios'
import { Input, Select, Modal, DatePicker, Table, Pagination } from 'antd'
import styles from './OrderList.module.css'
import { exportXlsx } from '../../../../../../utils/exportXlsx.js'

const OrderList = () => {

  const { RangePicker } = DatePicker

  // 查询参数
  const [queryParams, setQueryParams] = useState({
    merchant_no: '',
    trade_no: '',
    email: '',
    payment_method: 'all',
    payment_status: 'all',
    product: 'all',
    product_type: 'all',
    expire_status: 'all',
    expire_time: []
  })

  const [columns, setColumns] = useState([]) // 表格字段名
  const [showData, setShowData] = useState([]) // 展示的数据
  const [page, setPage] = useState(1) // 当前页数
  const [pageSize, setPageSize] = useState(10) // 每页展示数量
  const [total, setTotal] = useState(1) // 数据总数

  // 支付状态的键值对
  const paymentStatus = {
    '-1': 'To be paid',
    '0': 'payment successful',
    '1': 'payment failed',
    '2': 'refunding',
    '3': 'refund successfully',
    '4': 'refund failed'
  }

  // 支付状态的对应颜色
  const statusColors = {
    'To be paid': '#999999',
    'payment successful': '#1677FF',
    'payment failed': '#FFAB19',
    'refunding': '#FB7E00',
    'refund successfully': '#FB7E00',
    'refund failed': '#FFAB19'
  }

  // 所有搜索参数
  const inputArr = [
    { type: 'input', name: 'merchant_no', placeholder: 'merchant_no' }, // 商户号
    { type: 'input', name: 'trade_no', placeholder: 'trade_no' }, // 交易号
    { type: 'input', name: 'email', placeholder: 'email' }, // 用户邮箱
    {
      type: 'select', name: 'payment_method', placeholder: 'payment_method', list: [
        { label: 'all', value: 'all' },
        { label: 'ali', value: 'ali' }
      ], default: 'all'
    }, // 支付方式
    {
      type: 'select', name: 'payment_status', placeholder: 'payment_status',
      list: [
        { label: 'all', value: 'all' },
        { label: 'To be paid', value: '-1' },
        { label: 'payment successful', value: '0' },
        { label: 'payment failed', value: '1' },
        { label: 'refunding', value: '2' },
        { label: 'refund successfully', value: '3' },
        { label: 'refund failed', value: '4' }
      ], default: 'all'
    }, // 支付状态
    {
      type: 'select', name: 'product', placeholder: 'product',
      list: [
        { label: 'all', value: 'all' },
        { label: '专业版', value: '专业版' },
        { label: '高阶版', value: '高阶版' },
        { label: '取证版', value: '取证版' },
        { label: '加油包', value: '加油包' },
        { label: '超级加油包', value: '超级加油包' }
      ], default: 'all'
    }, // 产品名称
    {
      type: 'select', name: 'product_type', placeholder: 'product_type',
      list: [
        { label: 'all', value: 'all' },
        { label: 'business', value: 'business' },
        { label: 'individuals', value: 'individuals' }
      ], default: 'all'
    }, // 产品类型
    {
      type: 'select', name: 'expire_status', placeholder: 'expire_status',
      list: [
        { label: 'all', value: 'all' },
        { label: 'expired', value: '1' },
        { label: 'not Expired', value: '0' }
      ], default: 'all'
    }, // 服务到期状态
    { type: 'date', name: 'order_time', placeholder: 'order_time' }, // 服务到期时间
    { type: 'date', name: 'expire_time', placeholder: 'expire_time' } // 服务到期时间
  ]


  // 修改搜索参数
  const changeSearchParams = (value, name) => {
    const newParams = { ...queryParams }
    newParams[name] = value

    setQueryParams(newParams)
  }

  // 查询数据
  const searchData = async (myParams = queryParams, nowPage = page, size = pageSize, queryType = 1) => {

    const { data } = await axios.get(`${process.env.ONLINE_ADDRESS}/api/order-list`, {
      params: {
        ...myParams,
        page: nowPage,
        pageSize: size,
        queryType
      }
    })

    if (Array.isArray(data.data) && data.data.length > 0) {
      const datas = data.data.map(item => ({
        id: item.id,
        merchant_no: item.merchant_no,
        trade_no: item.trade_no,
        'product_name': `${item.name}(${item.type})`,
        'amount(CNY)': (Number(item.amount) / 100).toLocaleString(),
        email: item.email,
        payment_method: item.payment_method,
        payment_status: paymentStatus[item.payment_status],
        'order_time': dayjs(item.created_at).format('YYYY-MM-DD HH:mm:ss'),
        expire_time: dayjs(item.expire_time).format('YYYY-MM-DD HH:mm:ss')
      }))

      if (queryType === 1) { // 普通查询
        setShowData(datas)

        // 生成字段名
        const keys = Object.keys(datas[0]).filter(item => item !== 'id')
        setColumns(keys.map(item => {
          if (item === 'payment_status') {
            return {
              title: item,
              dataIndex: item,
              key: item,
              render: (text) => (
                <span
                  style={{
                    background: statusColors[text],
                    color: "#fff",
                    padding: "2px 7px",
                    borderRadius: "6px",
                    display: "inline-block",
                    fontSize: "12px"
                  }}
                >
                  {text}
                </span >
              )
            }
          } else return {
            title: item,
            dataIndex: item,
            key: item
          }
        }))
      }
      else {
        // 设置文件名称
        const fileName = `order data(${dayjs().format('YYYY-MM-DD')})`

        // 设置列宽
        const colWidth = 30

        // 去除id属性
        const dataList = datas.map(item => {
          const { id, ...rest } = item
          return rest
        })

        // 生成xlsx文件
        exportXlsx({ dataList, fileName, colWidth })
      }
    } else if (queryType === 1) {
      setShowData([])
    }

    setTotal(data.total)
  }

  // 初始加载数据
  useEffect(() => {
    searchData()
  }, [])

  return (
    <Fragment>
      <main style={{ width: '100%', display: 'flex' }}>
        <div style={{ width: '100%', padding: '20px' }}>
          {/* 根据字段搜索部分 */}
          <section>
            <ul className={styles.searchUl}>
              {
                inputArr.map((item, index) => (
                  <li key={index} className={styles.searchLi}>
                    <label className={styles.label}>
                      <span>{item.name}</span>
                      {
                        item.type === 'input' ?
                          <Input
                            className={styles.action}
                            placeholder={item.name}
                            onChange={e => changeSearchParams(e.target.value, item.name)}
                            onKeyDown={e => e.key == 'Enter' && queryParams[item.name] && searchData()}
                          />
                          : item.type === 'date' ?
                            <RangePicker
                              className={styles.action}
                              inputReadOnly={true} // true:禁止呼出输入法 默认为false
                              format="YYYY-MM-DD" // 左右两边显示的日期格式
                              onChange={(e, dates) => changeSearchParams(dates, item.name)}
                            />
                            :
                            <Select
                              className={styles.action}
                              defaultValue={item.default}
                              options={item.list}
                              onChange={e => changeSearchParams(e, item.name)}
                            />
                      }
                    </label>
                  </li>
                ))
              }

              {/* 搜索按钮&&导出按钮 */}
              <li className={styles.searchLi}>
                <button className={styles.buttonBlue} onClick={() => searchData()}>search</button>
                <button className={styles.buttonCyan} onClick={() => searchData(queryParams, page, pageSize, 2)}>export order list</button>
              </li>
            </ul>
          </section>

          {/* 数据展示部分 */}
          <section>
            <Table
              style={{ marginTop: '20px' }}
              columns={columns}
              dataSource={showData}
              rowKey='id'
              scroll={{ x: "max-content" }}
              pagination={false}
            />

            <div style={{ display: 'flex', justifyContent: 'right', alignItems: 'end', marginTop: '1.5rem' }}>
              <p style={{ marginRight: '1rem' }}>total:<span style={{ fontWeight: 'bold' }}>{total}</span></p>
              <Pagination
                align='end' // 对齐方式
                defaultCurrent={1} // 默认选中页数
                current={queryParams.page} // 当前页
                pageSize={queryParams.pageSize} // 每页展示条数
                total={total} // 总数据量
                onChange={(page, pageSize) => {
                  searchData(queryParams, page, pageSize)
                  setPage(page)
                  setPageSize(pageSize)
                }}
              />
            </div>
          </section>
        </div>
      </main>
    </Fragment>
  )
}

export default OrderList