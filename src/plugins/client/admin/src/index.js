// @ts-nocheck
import React from 'react'
import { prefixPluginTranslations } from '@strapi/helper-plugin'
import pluginPkg from '../../package.json'
import pluginId from './pluginId'
import Initializer from './components/Initializer'
import PluginIcon from './components/PluginIcon'
import { BlockOutlined } from '@ant-design/icons'

/**
 * 美元图标
 * DollarOutlined
 * 
 * 四角内陷图标
 * CompressOutlined
 * 
 * 三角圆形图标（agent
 * DeploymentUnitOutlined
 * 
 * 注册商标R图标
 * TrademarkCircleOutlined
 * 
 * user相关
 * UserAddOutlined
 * UserDeleteOutlined
 * UserOutlined
 * UserSwitchOutlined
 * UsergroupAddOutlined
 * UsergroupDeleteOutlined
 * 
 * 方块相叠图标
 * BlockOutlined
 */

const name = pluginPkg.strapi.name

export default {
  register(app) {
    app.addMenuLink({
      to: `/plugins/${pluginId}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: 'dashboard'
      },
      Component: async () => {
        const component = await import('./pages/App')

        return component
      },
      permissions: [
        // Uncomment to set the permissions of the plugin here
        // {
        //   action: '', // the action name should be plugin::plugin-name.actionType
        //   subject: null,
        // },
      ]
    })

    app.addMenuLink({
      to: `/plugins/email-edit`,
      icon: () => <BlockOutlined />,
      intlLabel: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: 'Email Template'
      },
      Component: async () => {
        const component = await import('./pages/EmailEdit')

        return component
      },
      permissions: [
        // Uncomment to set the permissions of the plugin here
        // {
        //   action: '', // the action name should be plugin::plugin-name.actionType
        //   subject: null,
        // },
      ]
    })
    app.registerPlugin({
      id: pluginId,
      initializer: Initializer,
      isReady: false,
      name
    })
  },

  bootstrap(app) { },
  async registerTrads({ locales }) {
    const importedTrads = await Promise.all(
      locales.map((locale) => {
        return import(
          /* webpackChunkName: "translation-[request]" */ `./translations/${locale}.json`
        )
          .then(({ default: data }) => {
            return {
              data: prefixPluginTranslations(data, pluginId),
              locale,
            };
          })
          .catch(() => {
            return {
              data: {},
              locale
            }
          })
      })
    )

    return Promise.resolve(importedTrads)
  }
}
