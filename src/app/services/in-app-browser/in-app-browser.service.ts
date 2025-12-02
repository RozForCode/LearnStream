import { Injectable } from '@angular/core';
import { InAppBrowser, AndroidViewStyle, AndroidAnimation, iOSViewStyle, iOSAnimation, DismissStyle, DefaultWebViewOptions } from '@capacitor/inappbrowser';

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
            await InAppBrowser.openInSystemBrowser({
                url: url,
                options: {
                    android: {
                        showTitle: true,
                        hideToolbarOnScroll: false,
                        viewStyle: AndroidViewStyle.BOTTOM_SHEET,
                        bottomSheetOptions: {
                            isFixed: false,
                            height: 500
                        },
                        startAnimation: AndroidAnimation.FADE_IN,
                        exitAnimation: AndroidAnimation.FADE_OUT
                    },
                    iOS: {
                        closeButtonText: DismissStyle.DONE,
                        viewStyle: iOSViewStyle.PAGE_SHEET,
                        animationEffect: iOSAnimation.COVER_VERTICAL,
                        enableBarsCollapsing: false,
                        enableReadersMode: false
                    }
                }
            });
        } catch (error) {
            console.error('Could not open InAppBrowser:', error);
            window.open(url, '_system');
        }
    }

    async openInWebView(url: string) {
        if (!url) {
            console.error('URL is required.');
            return;
        }
        try {
            await InAppBrowser.openInWebView({
                url: url,
                options: DefaultWebViewOptions
            });
        } catch (error) {
            console.error('Could not open WebView:', error);
        }
    }

    async close() {
        try {
            await InAppBrowser.close();
        } catch (error) {
            console.error('Could not close browser:', error);
        }
    }

    async addListener(eventName: 'browserClosed' | 'browserPageLoaded' | 'browserPageNavigationCompleted', listenerFunc: (data?: any) => void) {
        return await InAppBrowser.addListener(eventName as any, listenerFunc);
    }

    async removeAllListeners() {
        await InAppBrowser.removeAllListeners();
    }
}
