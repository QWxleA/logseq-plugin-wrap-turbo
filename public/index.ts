import "@logseq/libs"
import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin';

import { render } from "preact"
import { debounce, throttle } from "rambdax"
import Toolbar from "./Toolbar.jsx"

const TOOLBAR_ID = "kef-wrap-toolbar"
let toolbar
let textarea

const pluginName = ["wrap-turbo", "Wrap Turbo"]
export const settingsTemplate: SettingSchemaDesc[] = [{
  key: "toolbar",
  type: 'boolean',
  default: true,
  title: "Show toolbar",
  description: "Show toolbar when highlighting text",
},
{
  key: "yellow",
  type: 'string',
  inputAs: 'color',
  default: "#FFD800",
  title: "Important Point By Author",
  description: "Set to your preferred color",
},
{
  key: "yellowTxt",
  type: 'string',
  default: "Important Point By Author",
  title: "Important Point By Author",
  description: "Set description",
},
{
  key: "blue",
  type: 'string',
  inputAs: 'color',
  default: "#ABDFFF",
  title: "Quote / quotable",
  description: "Set to your preferred color",
},
{
  key: "blueTxt",
  type: 'string',
  default: "Quote / quotable",
  title: "Quote / quotable",
  description: "Set description",
},
{
  key: "green",
  type: 'string',
  inputAs: 'color',
  default: "#CCFFC1",
  title: "Quote / quotable",
  description: "Set to your preferred color",
},
{
  key: "greenTxt",
  type: 'string',
  default: "Important To Me",
  title: "Important To Me",
  description: "Set description",
},
{
  key: "red",
  type: 'string',
  inputAs: 'color',
  default: "#FFC7C7",
  title: "Disagree With Author",
  description: "Set to your preferred color",
},
{
  key: "redTxt",
  type: 'string',
  default: "Disagree With Author",
  title: "Disagree With Author",
  description: "Set description",
},
{
  key: "purple",
  type: 'string',
  inputAs: 'color',
  default: "#CA1CFF",
  title: "Interesting side-point",
  description: "Set to your preferred color",
},
{
  key: "purpleTxt",
  type: 'string',
  default: "Interesting side-point",
  title: "Interesting side-point",
  description: "Set description",
}
]
logseq.useSettingsSchema(settingsTemplate);

function colIcon(color) {
  return `<svg t="1643262039637" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6950" xmlns:xlink="http://www.w3.org/1999/xlink" width="200" height="200"><defs><style type="text/css"></style></defs><path d="M114.727313 1024l0.305421-0.427589h-0.977347l0.671926 0.427589zM632.721199 809.365446c-156.680934 0-272.466006 41.644143-341.659116 75.927642L290.878831 972.108985C340.402833 942.605324 458.249497 885.720677 632.73647 885.720677H962.804862v-76.355231H632.73647z m-109.432317-72.018253l252.048617-528.378197a38.177615 38.177615 0 0 0-13.621773-48.790993L551.295981 24.464216a38.192886 38.192886 0 0 0-50.089031 7.696607L130.349594 483.908911a38.208157 38.208157 0 0 0-7.024682 35.886958c31.763776 100.315502 36.436716 182.626441 34.695817 234.777064L94.477906 870.449631h132.094549l32.221908-42.606219c49.78361-25.624815 134.15614-60.931474 233.326314-69.177839a38.147073 38.147073 0 0 0 31.152934-21.31838z m-59.343285-52.54767c-71.66702 8.505973-134.950235 28.572127-184.489509 49.157497l-45.339736-29.244053c-2.290657-50.883126-10.613377-114.716099-31.901215-187.849139l336.161539-409.874879 153.474014 98.986922-193.728492 408.653195-176.838714-112.746134-47.935814 60.015211 191.117142 121.847678-0.519215 1.053702z" p-id="6951" fill="${color}"></path></svg>`;

}

async function main() {
  // Reset values.
  toolbar = null
  textarea = null

  const definitions = await getDefinitions()
  
  logseq.provideStyle(`
    #kef-wrap-toolbar {
      position: absolute;
      top: 0;
      left: -99999px;
      z-index: var(--ls-z-index-level-2);
      opacity: 0;
      will-change: opacity;
      transition: opacity 100ms ease-in-out;
      background: #333;
      border-radius: 6px;
      color: #fff;
      display: flex;
      align-items: center;
      height: 30px;
      padding: 0 10px;
    }
    .kef-wrap-tb-item {
      width: 30px;
      line-height: 20px;
      height: 30px;
      overflow: hidden;
      text-align: center;
      padding: 5px;
      margin: 0 2px;
      cursor: pointer;
    }
    .kef-wrap-tb-item:hover {
      filter: drop-shadow(0 0 3px #fff);
    }
    .kef-wrap-tb-item img {
      width: 20px;
      height: 20px;
    }

    span[data-ref="#yellow"],
    span[data-ref="#purple"],
    span[data-ref="#red"],
    span[data-ref="#green"],
    span[data-ref="#blue"],
    span[data-ref="$red"],
    span[data-ref="$green"],
    span[data-ref="$blue"] {
      display: none;
    }
    span[data-ref="#red"] + mark {
      background: ${logseq.settings.red};
    }
    span[data-ref="#green"] + mark {
      background: ${logseq.settings.green};
    }
    span[data-ref="#blue"] + mark {
      background: ${logseq.settings.blue};
    }
    span[data-ref="#yellow"] + mark {
      background: ${logseq.settings.yellow};
    }
    span[data-ref="#purple"] + mark {
      background: ${logseq.settings.purple};
    }
    span[data-ref="$red"] + mark {
      color: ${logseq.settings.red};
      background: unset;
      padding: 0;
      border-radius: 0;
    }
    span[data-ref="$green"] + mark {
      color: ${logseq.settings.green};
      background: unset;
      padding: 0;
      border-radius: 0;
    }
    span[data-ref="$blue"] + mark {
      color: ${logseq.settings.blue}f;
      background: unset;
      padding: 0;
      border-radius: 0;
    }
    span[data-ref="$purple"] + mark {
      color: ${logseq.settings.purple};
      background: unset;
      padding: 0;
      border-radius: 0;
    }
    span[data-ref="$yellow"] + mark {
      color: ${logseq.settings.yellow};
      background: unset;
      padding: 0;
      border-radius: 0;
    }
  `)

  const model = {}
  for (const { key, template, regex, replacement } of definitions) {
    model[key] = key.startsWith("wrap-")
      ? () => updateBlockText(wrap, template)
      : () => updateBlockText(repl, regex, replacement)
  }
  logseq.provideModel(model)

  if (logseq.settings?.toolbar ?? true) {
    logseq.provideUI({
      key: TOOLBAR_ID,
      path: "#app-container",
      template: `<div id="${TOOLBAR_ID}"></div>`,
    })

    // Let div root element get generated first.
    setTimeout(async () => {
      toolbar = parent.document.getElementById(TOOLBAR_ID)
      render(<Toolbar items={definitions} model={model} />, toolbar)

      toolbar.addEventListener("transitionend", onToolbarTransitionEnd)
      parent.document.addEventListener("focusout", onBlur)

      const mainContentContainer = parent.document.getElementById(
        "main-content-container",
      )
      mainContentContainer.addEventListener("scroll", onScroll, {
        passive: true,
      })
    }, 0)
  }

  parent.document.addEventListener("selectionchange", onSelectionChange)

  logseq.beforeunload(async () => {
    const mainContentContainer = parent.document.getElementById(
      "main-content-container",
    )
    mainContentContainer.removeEventListener("scroll", onScroll, {
      passive: true,
    })
    toolbar?.removeEventListener("transitionend", onToolbarTransitionEnd)
    parent.document.removeEventListener("focusout", onBlur)
    parent.document.removeEventListener("selectionchange", onSelectionChange)
  })

  //loop through definitions
  // FIXME unregister keys first
  for (const { key, label, binding } of definitions) {
    if (binding) {
      logseq.App.registerCommandPalette(
        { key, label, keybinding: { binding } },
        model[key],
      )
    } else {
      logseq.App.registerCommandPalette({ key, label }, model[key])
    }
  }

  console.log(`Plugin ${pluginName[0]} loaded`)
}

async function getDefinitions() {
  if (
    logseq.settings &&
    Object.keys(logseq.settings).some((k) => k.startsWith("wrap-"))
  ) {
    return Object.entries(logseq.settings)
      .filter(([k, v]) => k.startsWith("wrap-") || k.startsWith("repl-"))
      .map(([k, v]) => ({ key: k, ...v }))
  }

  const { preferredLanguage: lang, preferredFormat } =
    await logseq.App.getUserConfigs()
  return [
    {
      key: "wrap-cloze",
      label: lang === "zh-CN" ? "包围成 cloze" : "Wrap with cloze",
      binding: "",
      template: " {{cloze $^}}",
      icon: `<svg t="1643261888324" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5478" xmlns:xlink="http://www.w3.org/1999/xlink" width="200" height="200"><defs><style type="text/css"></style></defs><path d="M341.333333 396.8V320H170.666667v384h170.666666v-76.8H256V396.8zM682.666667 396.8V320h170.666666v384h-170.666666v-76.8h85.333333V396.8zM535.04 533.333333h40.96v-42.666666h-40.96V203.093333l92.16-24.746666-11.093333-40.96-102.4 27.306666-102.4-27.306666-11.093334 40.96 92.16 24.746666v287.573334H448v42.666666h44.373333v287.573334l-92.16 24.746666 11.093334 40.96 102.4-27.306666 102.4 27.306666 11.093333-40.96-92.16-24.746666z" p-id="5479" fill="#eeeeee"></path></svg>`,
    },
    {
      key: "wrap-yellow-hl",
      label: lang === "zh-CN" ? "包围成红色高亮" : logseq.settings.yellowTxt,
      binding: "",
      template: preferredFormat === "org" ? "[[#yellow]]^^$^^^" : "[[#yellow]]==$^==",
      icon: colIcon(logseq.settings.yellow),
    },
    {
      key: "wrap-blue-hl",
      label: lang === "zh-CN" ? "包围成蓝色高亮" : logseq.settings.blueTxt,
      binding: "",
      template:
        preferredFormat === "org" ? "[[#blue]]^^$^^^" : "[[#blue]]==$^==",
      icon: colIcon(logseq.settings.blue),
    },
    {
      key: "wrap-green-hl",
      label: lang === "zh-CN" ? "包围成绿色高亮" : logseq.settings.greenTxt,
      binding: "",
      template:
        preferredFormat === "org" ? "[[#green]]^^$^^^" : "[[#green]]==$^==",
      icon: colIcon(logseq.settings.green),
    },
    {
      key: "wrap-red-hl",
      label: lang === "zh-CN" ? "包围成红色高亮" : logseq.settings.redTxt,
      binding: "",
      template: preferredFormat === "org" ? "[[#red]]^^$^^^" : "[[#red]]==$^==",
      icon: colIcon(logseq.settings.red),
    },
    {
      key: "wrap-purple-hl",
      label: lang === "zh-CN" ? "包围成红色高亮" : logseq.settings.purpleTxt,
      binding: "",
      template: preferredFormat === "org" ? "[[#purple]]^^$^^^" : "[[#purple]]==$^==",
      icon: colIcon(logseq.settings.purple),
    },
    {
      key: "repl-clear",
      label: lang === "zh-CN" ? "去除格式化" : "Remove formatting",
      binding: "mod+shift+x",
      regex: `\\[\\[(?:#|\\$)(?:red|green|blue)\\]\\]|==([^=]*)==|~~([^~]*)~~|\\^\\^([^\\^]*)\\^\\^|\\*\\*([^\\*]*)\\*\\*|\\*([^\\*]*)\\*|_([^_]*)_|\\$([^\\$]*)\\$`,
      replacement: "$1$2$3$4$5$6",
      icon: `<svg t="1643381967522" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1377" width="200" height="200"><path d="M824.4 438.8c0-37.6-30-67.6-67.6-67.6l-135.2 0L621.6 104.8c0-37.6-30-67.6-67.6-67.6-37.6 0-67.6 30-67.6 67.6l0 266.4L358.8 371.2c-37.6 0-67.6 30-67.6 67.6l0 67.6L828 506.4l0-67.6L824.4 438.8 824.4 438.8zM824.4 574c-11.2 0-536.8 0-536.8 0S250 972 88.4 972L280 972c75.2 0 108.8-217.6 108.8-217.6s33.6 195.2 3.6 217.6l105.2 0c-3.6 0 0 0 11.2 0 52.4-7.6 60-247.6 60-247.6s52.4 244 45.2 244c-26.4 0-78.8 0-105.2 0l0 0 154 0c-7.6 0 0 0 11.2 0 48.8-11.2 52.4-187.6 52.4-187.6s22.4 187.6 15.2 187.6c-18.8 0-48.8 0-67.6 0l-3.6 0 90 0C895.6 972 903.2 784.4 824.4 574L824.4 574z" p-id="1378" fill="#eeeeee"></path></svg>`,
    },
  ]
}

async function updateBlockText(producer, ...args) {
  const block = await logseq.Editor.getCurrentBlock()

  if (block == null || textarea == null) {
    const { preferredLanguage: lang } = await logseq.App.getUserConfigs()
    logseq.App.showMsg(
      lang === "zh-CN"
        ? "该命令仅在编辑文字时可使用"
        : "This command can only be used when editing text",
      "error",
    )
    return
  }

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const before = textarea.value.substring(0, start)
  const selection = textarea.value.substring(start, end)
  const after = textarea.value.substring(end)
  const [text, selStart, selEnd] = await producer(
    before,
    selection,
    after,
    start,
    end,
    ...args,
  )
  await logseq.Editor.updateBlock(block.uuid, text)
  if (textarea?.isConnected) {
    textarea.focus()
    textarea.setSelectionRange(selStart, selEnd)
  } else {
    await logseq.Editor.editBlock(block.uuid)
    parent.document.activeElement.setSelectionRange(selStart, selEnd)
  }
}

function wrap(before, selection, after, start, end, template) {
  const m = selection.match(/\s+$/)
  const [text, whitespaces] =
    m == null ? [selection, ""] : [selection.substring(0, m.index), m[0]]
  const [wrapBefore, wrapAfter] = template.split("$^")
  return [
    `${before}${wrapBefore}${text}${wrapAfter ?? ""}${whitespaces}${after}`,
    start + wrapBefore.length,
    end + wrapBefore.length - whitespaces.length,
  ]
}

function repl(before, selection, after, start, end, regex, replacement) {
  const newText = selection.replace(new RegExp(regex, "g"), replacement)
  return [`${before}${newText}${after}`, start, start + newText.length]
}

async function onSelectionChange(e) {
  const activeElement = parent.document.activeElement
  if (
    activeElement !== textarea &&
    activeElement.nodeName.toLowerCase() === "textarea"
  ) {
    textarea = activeElement
  }

  if (toolbar != null && activeElement === textarea) {
    if (
      textarea.selectionStart === textarea.selectionEnd &&
      toolbar.style.opacity !== "0"
    ) {
      toolbar.style.opacity = "0"
    } else if (textarea.selectionStart !== textarea.selectionEnd) {
      await positionToolbar()
    }
  }
}

async function positionToolbar() {
  const curPos = await logseq.Editor.getEditingCursorPosition()
  if (curPos != null) {
    toolbar.style.top = `${curPos.top + curPos.rect.y - 35}px`
    if (
      curPos.left + curPos.rect.x + toolbar.clientWidth <=
      parent.window.innerWidth
    ) {
      toolbar.style.left = `${curPos.left + curPos.rect.x}px`
    } else {
      toolbar.style.left = `${
        -toolbar.clientWidth + parent.window.innerWidth
      }px`
    }
    toolbar.style.opacity = "1"
  }
}

function onToolbarTransitionEnd(e) {
  if (toolbar.style.opacity === "0") {
    toolbar.style.top = "0"
    toolbar.style.left = "-99999px"
  }
}

function onBlur(e) {
  // Update toolbar visibility upon activeElement change.
  if (document.activeElement !== textarea && toolbar?.style.opacity !== "0") {
    toolbar.style.opacity = "0"
  }
}

// There is a large gap between 2 displays of the toolbar, so a large
// ms number is acceptable.
const hideToolbar = throttle(() => {
  if (toolbar.style.opacity !== "0") {
    toolbar.style.opacity = "0"
  }
}, 1000)

const showToolbar = debounce(async () => {
  if (textarea != null && textarea.selectionStart !== textarea.selectionEnd) {
    await positionToolbar()
  }
}, 100)

function onScroll(e) {
  hideToolbar()
  showToolbar()
}

logseq.ready(main).catch(console.error)
