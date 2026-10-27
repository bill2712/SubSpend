import { CONTACT_EMAIL, LEGAL_LAST_UPDATED, SITE_NAME } from '../../config/site';
import type { TextPageContent } from '../types';

const ext = { target: '_blank', rel: 'noopener noreferrer' } as const;

const content: TextPageContent = {
  title: '私隱政策',
  updated: LEGAL_LAST_UPDATED,
  lead: '簡單來說：你追蹤的訂閱從不會離開你的瀏覽器。本頁說明儲存了甚麼、第三方可能收到甚麼，以及你擁有的選擇。',
  body: (
    <>
      <h2>1. 我們是誰</h2>
      <p>
        {SITE_NAME}（「我們」）是一個協助你追蹤訂閱的免費網站。你可以透過 <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> 聯絡我們。
      </p>

      <h2>2. 你輸入的資料留在你的裝置上</h2>
      <p>
        你在追蹤工具中輸入的訂閱資料、設定及偏好，都儲存在你自己裝置上瀏覽器的<strong>本機儲存空間（local storage）</strong>。這些資料不會傳送給我們或我們營運的任何伺服器——我們沒有可以接收資料的伺服器，亦沒有用戶帳戶。我們無法查看、復原或替你刪除這些資料。
      </p>
      <p>具體而言，追蹤工具會在本機儲存空間中儲存：</p>
      <ul>
        <li>你的訂閱及設定（貨幣、提醒偏好、手動匯率）；</li>
        <li>如你使用多於一種貨幣，最新匯率的快取副本；</li>
        <li>你的顏色主題及最後開啟的分頁；</li>
        <li>哪些提醒通知已經顯示過，以免重複；</li>
        <li>你是否已關閉「請我喝杯咖啡」卡片，以及關閉的時間。</li>
      </ul>
      <p>你可以隨時在追蹤工具中使用「清除所有資料」，或在瀏覽器中清除本網站的資料，以刪除上述全部內容。本機儲存並非 Cookie，亦不會隨網絡請求傳送。</p>
      <p>請勿輸入完整信用卡號碼、密碼或身份證號碼等敏感資料。付款方式欄位只供輸入簡短標籤，例如「Visa 尾號 1234」。</p>

      <h2>3. 匯出、匯入及行事曆檔案</h2>
      <p>
        當你匯出備份（JSON）、試算表（CSV）或行事曆檔案（.ics）時，檔案會在你的瀏覽器中產生並儲存到你的裝置。匯入備份時，檔案亦在你的瀏覽器中讀取。這些檔案均不會上載給我們。如你在行事曆服務中開啟行事曆檔案，你所加入的事件將受該服務的私隱政策約束。
      </p>

      <h2>4. 瀏覽器通知</h2>
      <p>通知預設為關閉。如你開啟通知，瀏覽器會請求你的許可。通知由網頁在開啟期間於本機建立；我們不使用推送服務，亦不會收到任何識別你裝置的資料。你可以隨時在瀏覽器的網站設定中撤回許可。</p>

      <h2>5. 匯率請求</h2>
      <p>
        如你的訂閱使用多於一種貨幣，你的瀏覽器會向免費的公開匯率服務請求每日參考匯率（目前為{' '}
        <a href="https://www.exchangerate-api.com" {...ext}>
          ExchangeRate-API
        </a>{' '}
        的公開端點，並以經 jsDelivr 或 Cloudflare Pages 提供的社群項目{' '}
        <a href="https://github.com/fawazahmed0/exchange-api" {...ext}>
          exchange-api
        </a>{' '}
        作後備）。請求不包含任何有關你訂閱的資料。與任何網絡請求一樣，該供應商可看到你的 IP 地址及基本瀏覽器資料，並受其私隱政策約束。匯率大約每日最多請求一次。如你只使用一種貨幣，則不會發出任何請求。
      </p>

      <h2>6. 網站寄存</h2>
      <p>本網站由靜態網站寄存服務供應商（例如 Vercel 或 Cloudflare）提供。與所有網站寄存服務一樣，供應商可能在伺服器紀錄中處理傳送網頁及保障服務安全所需的技術資料——例如你的 IP 地址、瀏覽器類型及所請求的網頁——並受其私隱政策約束。我們不會使用這些紀錄來識別你。</p>

      <h2>7. 廣告及 Cookie（Google AdSense）</h2>
      <p>我們展示由 Google AdSense 提供的廣告，以維持網站免費。廣告只會在設有廣告位置的網頁載入，而且只在廣告位置即將進入畫面時才載入。</p>
      <ul>
        <li>包括 Google 在內的第三方供應商會使用 Cookie，根據用戶過往瀏覽本網站或其他網站的紀錄投放廣告。</li>
        <li>Google 使用廣告 Cookie，令其及其合作夥伴能根據你瀏覽本網站及／或互聯網上其他網站的紀錄向你投放廣告。</li>
        <li>
          你可以前往 Google 的
          <a href="https://adssettings.google.com" {...ext}>
            廣告設定
          </a>
          （我的廣告中心）停用個人化廣告。你亦可以在{' '}
          <a href="https://www.aboutads.info/choices" {...ext}>
            www.aboutads.info
          </a>{' '}
          或（歐洲用戶）
          <a href="https://www.youronlinechoices.eu" {...ext}>
            www.youronlinechoices.eu
          </a>{' '}
          停止部分第三方供應商使用 Cookie 投放個人化廣告。
        </li>
        <li>
          詳情請參閱
          <a href="https://policies.google.com/technologies/partner-sites" {...ext}>
            Google 如何使用來自使用其服務的網站或應用程式的資料
          </a>
          及
          <a href="https://policies.google.com/technologies/ads" {...ext}>
            Google 的廣告政策
          </a>
          。
        </li>
      </ul>
      <p>如法律有所要求（例如在歐洲經濟區、英國及瑞士），我們會在使用個人化廣告或廣告 Cookie 前，透過同意訊息徵求你的同意。廣告永遠無法存取儲存在你瀏覽器中的訂閱資料。</p>

      <h2>8. 其他網站的連結</h2>
      <p>我們的指南連結至監管機構、消費者機構及服務供應商的官方網頁，本網站亦連結至 Buy Me a Coffee。這些網站各有其私隱政策，於你瀏覽時適用。</p>

      <h2>9. 兒童</h2>
      <p>本網站是供一般大眾使用的工具，並非以 13 歲以下兒童為對象。我們不會在知情的情況下收集任何人的個人資料。</p>

      <h2>10. 你的權利</h2>
      <p>
        由於追蹤工具的資料只儲存在你的裝置上，你可以完全掌控它：隨時查看、匯出、更改及刪除。有關 Google 為廣告而處理的資料，請參閱 Google 的私隱政策。如有其他私隱問題，請電郵至 <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>。
      </p>

      <h2>11. 政策修訂</h2>
      <p>如我們更改網站處理資料的方式，將會更新本頁及頁首的日期。如中英文版本有任何差異，以英文版本為準。</p>
    </>
  ),
};

export default content;
