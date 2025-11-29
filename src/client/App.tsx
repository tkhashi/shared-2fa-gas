import React, { useState, useEffect } from 'react';
import { TotpPageData, ServiceAccount, encodeServiceAccountId, TOTP_STEP_SECONDS } from '../types';

interface AppProps {
  initialData: string;
}

const App: React.FC<AppProps> = ({ initialData }) => {
  const [data, setData] = useState<TotpPageData>(() => JSON.parse(initialData));
  const [remainingSec, setRemainingSec] = useState<number>(data.remaining || TOTP_STEP_SECONDS);

  // カウントダウンタイマー
  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSec((prev) => {
        if (prev <= 0) {
          return TOTP_STEP_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      <h1>Shared 2FA</h1>

      <form method="post" action={data.formAction || ''}>
        <select id="selector" name="entry" defaultValue="">
          <option value="">選択してください</option>
          {data.items?.map((item) => (
            <option key={`${item.service}-${item.account}`} value={encodeServiceAccountId(item)}>
              {item.service} / {item.account}
            </option>
          ))}
        </select>

        <button type="submit">コード取得</button>
      </form>

      <h2>現在のコード</h2>
      <div id="token" style={{ fontSize: '2em', fontFamily: 'monospace' }}>
        {data.token || ''}
      </div>
      <div>
        残り <span id="remaining">{remainingSec}</span> 秒
      </div>
    </div>
  );
};

export default App;
