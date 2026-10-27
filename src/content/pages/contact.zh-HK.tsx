import { CONTACT_EMAIL, SITE_NAME } from '../../config/site';
import type { TextPageContent } from '../types';

const content: TextPageContent = {
  title: '聯絡我們',
  lead: '我們會細閱每一則訊息。以下是聯絡我們的方法。',
  body: (
    <>
      <h2>電郵</h2>
      <p>
        請電郵至 <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>。我們一般會在數個工作天內回覆。
      </p>

      <h2>請提供以下資料</h2>
      <ul>
        <li>
          <strong>錯誤報告：</strong>你做了甚麼、預期的結果、實際發生的情況，以及你使用的瀏覽器和裝置。
        </li>
        <li>
          <strong>指南更正：</strong>相關網頁、句子，以及（如有）官方資料來源的連結。
        </li>
        <li>
          <strong>服務清單建議：</strong>服務名稱及類別。我們只加入名稱——從不加入價錢。
        </li>
      </ul>

      <h2>請不要寄出你的資料</h2>
      <p>{SITE_NAME} 從不需要你的訂閱清單來協助你，我們亦無法存取它。請不要電郵信用卡號碼、密碼，或包含個人資料的備份檔案給我們。</p>

      <h2>有關個別訂閱的協助</h2>
      <p>
        我們與所列的任何服務均無關聯，無法代你取消、退款或更改訂閱。如有賬單問題，請聯絡向你收費的供應商或應用程式商店。我們的<a href="/zh-hk/guides/how-to-cancel-subscriptions/">取消訂閱指南</a>解釋了一般步驟。
      </p>
    </>
  ),
};

export default content;
