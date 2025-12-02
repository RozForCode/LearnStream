import { Injectable } from '@angular/core';
import { Browser } from '@capacitor/browser';

@Injectable({
    providedIn: 'root'
})
export class InAppBrowserService {

    constructor() { }

    async openLinkInApp(url: string) {
        if (!url) {
            console.error('URL is required.');
            return;
        }
        try {
            await Browser.open({ url });
        } catch (error) {
            console.error('Could not open browser:', error);
            window.open(url, '_blank');
        }
    }

    async openInWebView(url: string) {
        if (!url) {
            console.error('URL is required.');
            return;
        }
        try {
            await Browser.open({ url });
        } catch (error) {
            console.error('Could not open WebView:', error);
            window.open(url, '_blank');
        }
    }

    async close() {
        try {
            await Browser.close();
        } catch (error) {
            console.error('Could not close browser:', error);
        }
    }
}
