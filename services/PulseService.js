/**
 * TabSuspender HaYTooL - Layer 2: Business Logic Layer
 * PulseService: Canlı kullanıcı ve sistem sağlık sayacı (Heartbeat / Pulse).
 * Sıfır IP, sıfır çerez, sıfır kişisel veri. Yalnızca rastgele oturum nabzı.
 */
export class PulseService {
    static PULSE_ENDPOINT = 'https://hayto-telemetry.korazhayto.workers.dev/api/ping';
    static APP_ID = 'tabsuspender';

    static init() {
        const sessionId = 'ext_' + Math.random().toString(36).substring(2, 15);
        let isFirst = true;

        const sendPulse = async () => {
            try {
                await fetch(this.PULSE_ENDPOINT, {
                    method: 'POST',
                    mode: 'cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        app: this.APP_ID,
                        session_id: sessionId,
                        is_new_session: isFirst
                    })
                });
                isFirst = false;
            } catch (e) {
                // Sessizce geç (kullanıcı deneyimini etkilemez)
            }
        };

        // İlk başlangıç nabzı
        sendPulse();

        // 2 dakikada bir periyodik nabız (Manifest V3 Alarms)
        if (typeof chrome !== 'undefined' && chrome.alarms) {
            chrome.alarms.create('haytool_pulse_alarm', { periodInMinutes: 2 });
            chrome.alarms.onAlarm.addListener((alarm) => {
                if (alarm.name === 'haytool_pulse_alarm') {
                    sendPulse();
                }
            });
        } else {
            setInterval(sendPulse, 2 * 60 * 1000);
        }
    }
}
