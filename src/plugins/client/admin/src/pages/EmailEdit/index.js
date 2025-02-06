// @ts-nocheck
import React, { useEffect, useState, useRef, Fragment, useMemo } from 'react'
import axios from 'axios'
import dayjs, { locale } from 'dayjs'
import styled from 'styled-components'
import { CloseOutlined } from '@ant-design/icons'
import { Modal } from 'antd'
import App from '../../components/app/index.js'
import styles from './EmailEdit.module.css'

// 自定义滚动条(ul
const ScrollUlShow = styled('ul')({
  '-msOverflowStyle': 'none',  /* 适用于 IE 和 Edge */
  scrollbarWidth: 'thin',  /* 适用于 Firefox，设置滚动条为细 */
  '&::-webkit-scrollbar': {
    width: '4px',  /* 设置滚动条的宽度为 4px */
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#888',  /* 设置滚动条滑块的颜色 */
    borderRadius: '10px',  /* 设置滑块圆角 */
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: '#f1f1f1',  /* 设置滚动条轨道的颜色 */
  },
  '@media (max-width: 600px)': {
    '-msOverflowStyle': 'none',  /* 适用于 IE 和 Edge */
    scrollbarWidth: 'none',  /* 适用于 Firefox */
    '&::-webkit-scrollbar': {
      display: 'none', /* 适用于 WebKit 浏览器（如 Chrome、Safari 和新版 Edge） */
    }
  }
})

// 自定义滚动条(div
const ScrollDiv = styled('div')({
  '-msOverflowStyle': 'none',  /* 适用于 IE 和 Edge */
  scrollbarWidth: 'thin',  /* 适用于 Firefox，设置滚动条为细 */
  '&::-webkit-scrollbar': {
    width: '4px',  /* 设置滚动条的宽度为 4px */
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#888',  /* 设置滚动条滑块的颜色 */
    borderRadius: '10px',  /* 设置滑块圆角 */
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: '#f1f1f1',  /* 设置滚动条轨道的颜色 */
  },
  '@media (max-width: 600px)': {
    '-msOverflowStyle': 'none',  /* 适用于 IE 和 Edge */
    scrollbarWidth: 'none',  /* 适用于 Firefox */
    '&::-webkit-scrollbar': {
      display: 'none', /* 适用于 WebKit 浏览器（如 Chrome、Safari 和新版 Edge） */
    }
  }
})

// 自定义滚动条(textarea
const ScrollTextarea = styled('textarea')({
  '-msOverflowStyle': 'none',  /* 适用于 IE 和 Edge */
  scrollbarWidth: 'thin',  /* 适用于 Firefox，设置滚动条为细 */
  '&::-webkit-scrollbar': {
    width: '4px',  /* 设置滚动条的宽度为 4px */
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#888',  /* 设置滚动条滑块的颜色 */
    borderRadius: '10px',  /* 设置滑块圆角 */
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: '#f1f1f1',  /* 设置滚动条轨道的颜色 */
  },
  '@media (max-width: 600px)': {
    '-msOverflowStyle': 'none',  /* 适用于 IE 和 Edge */
    scrollbarWidth: 'none',  /* 适用于 Firefox */
    '&::-webkit-scrollbar': {
      display: 'none', /* 适用于 WebKit 浏览器（如 Chrome、Safari 和新版 Edge） */
    }
  }
})

const EmailEdit = () => {

  // 展示的模板数据
  const [showData, setShowData] = useState([])
  const [showUpdate, setShowUpdate] = useState({ locale: 'en', flag: false, name: '', initHtml: '', newHtml: '' }) // 显示修改内容弹窗

  const [nowPage, setnowPage] = useState(0) // 当前选择的弹窗tab
  const typingRef = useRef(null) // 存储更新倒计时ref

  // 分页参数
  const [pagination, setPagination] = useState({
    pageNum: 50, // 每页数量
    offset: 0, // 偏移量
    maxNum: false // 全部数据查询完毕
  })
  const [scroll, setScroll] = useState(0) // 滚动百分比
  const dom = useRef(null) // 监听滚动进度

  // 获取数据
  const getData = async nowOffset => {
    const response = await axios.get('/api/sendTemplate/findMany', {
      params: {
        offset: nowOffset,
        pageNum: pagination.pageNum,
        orderBy: 'createdAt',
        sortBy: 'DESC'
      }
    })

    if (response.data.length === 0) setPagination(page => ({ ...page, maxNum: true }))

    const newArr = [...showData, ...response.data].sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf())
    setShowData([...newArr])
  }

  useEffect(() => {
    getData(0)
  }, [])

  // 监听元素滚动条
  useEffect(() => {
    const handleScroll = () => {
      if (dom.current) {
        const { scrollTop, scrollHeight, clientHeight } = dom.current
        const progress = ((scrollTop / (scrollHeight - clientHeight)) * 100).toFixed(0)

        if (progress >= 75) setScroll(progress)
      }
    }

    handleScroll()

    if (dom.current) dom.current.addEventListener('scroll', handleScroll)

    return () => {
      if (dom.current) dom.current.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    if (scroll >= 100 && !pagination.maxNum) {
      const nowOffset = pagination.offset + pagination.pageNum

      getData(nowOffset)

      setPagination(pages => ({ ...pages, offset: nowOffset }))
    }
  }, [scroll])

  // 获取模板详情（html
  const handleDetail = item => {

    if (showUpdate.name !== item.name) {
      const nowData = showData.filter(e => e.name === item.name)[0]

      setShowUpdate(old => ({ ...old, name: nowData.name, initHtml: nowData.content, newHtml: nowData.content, flag: true }))
    } else setShowUpdate(old => ({ ...old, flag: true }))
  }

  // 显示详情内容部分
  const showContent = useMemo(() => {
    if (nowPage === 0) return <ScrollDiv style={{ height: '90vh', maxHeight: '774px', overflow: 'auto', border: '1px solid #DCDCDC' }} dangerouslySetInnerHTML={{ __html: showUpdate.newHtml }}></ScrollDiv>

    return <ScrollTextarea
      key={showUpdate.name}
      style={{ width: '100%', height: '768px' }}
      rows={26}
      defaultValue={showUpdate.newHtml}
      onChange={e => {
        const value = e.target.value

        if (typingRef.current) clearTimeout(typingRef.current)

        typingRef.current = setTimeout(() => {
          if (value !== showUpdate.newHtml) setShowUpdate(old => ({ ...old, newHtml: value }))
        }, 1000)
      }}
    ></ScrollTextarea>
  }, [showUpdate, nowPage])

  // 保存修改
  const saveChange = async () => {
    try {
      const { data } = await axios.put('/api/sendTemplate/update', {
        name: showUpdate.name,
        content: showUpdate.newHtml
      })

      if (data.data) setShowUpdate(old => ({ ...old, initHtml: data.data.content, newHtml: data.data.content, flag: false }))
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div style={{ padding: '60px' }}>
      <App />

      <ScrollUlShow ref={dom} className={styles.ul}>
        <li>
          <p style={{ paddingLeft: '21px' }}>Template Name</p>
          <p>Remark</p>
          <p>Actions</p>
        </li>

        {
          showData.map((item, index) => (
            <li key={index}>
              <p style={{ paddingLeft: '21px' }}>{item.name}</p>
              <p>{item.remark}</p>
              <div>
                <button style={{ background: '#0EA5E9' }} onClick={() => handleDetail(item)}>修改默认模板</button>
              </div>
            </li>
          ))
        }
      </ScrollUlShow>

      {/* 弹窗 */}
      <Modal
        open={showUpdate.flag}
        onCancel={() => setShowUpdate(old => ({ ...old, flag: false }))}
        title='邮箱模板'
        footer={null}
        width='90%'
        style={{
          maxWidth: '1100px',
          minHeiht: '930px',
          padding: '20px 24px'
        }}
      >
        <p style={{ color: 'red' }}>ps:括号里面内容属于动态内容不要修改</p>

        {/* tab */}
        <div style={{ width: '100%', height: '42px', background: '#EAEAEA', borderRadius: '8px', margin: '10px 0px', position: 'relative', userSelect: 'none' }}>
          <div style={{ width: '100%', height: '38px', display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', position: 'relative', zIndex: '54' }}>
            <h2 style={{ height: '38px', lineHeight: '38px', textAlign: 'center', cursor: 'pointer', fontWeight: nowPage === 0 ? 'bold' : '400' }} onClick={() => setnowPage(0)}>View</h2>
            <h2 style={{ height: '38px', lineHeight: '38px', textAlign: 'center', cursor: 'pointer', fontWeight: nowPage === 1 ? 'bold' : '400' }} onClick={() => setnowPage(1)}>Edit</h2>
          </div>

          <div style={{ width: '50%', height: '38px', background: 'white', boxShadow: '0px 1px 3px 0px #00000033', borderRadius: '6px', position: 'absolute', transition: 'left .2s ease-in-out', top: '2px', left: nowPage === 0 ? '2px' : 'calc(50% - 2px)', zIndex: '52' }}></div>
        </div>

        {showContent}

        {/* 保存修改 */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '21px' }}>
          <button
            style={{ padding: '8px 12px', background: '#0EA5E9', borderRadius: '6px', color: 'white', cursor: `${showUpdate.initHtml === showUpdate.newHtml ? 'no-drop' : 'pointer'}` }}
            disabled={showUpdate.initHtml === showUpdate.newHtml}
            title={showUpdate.initHtml === showUpdate.newHtml ? '未修改内容，无法保存' : ''}
            onClick={saveChange}
          >保存修改</button>
        </div>
      </Modal>
    </div >
  )
}

export default EmailEdit
