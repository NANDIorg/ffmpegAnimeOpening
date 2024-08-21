import { Browser, by, be } from 'selenidejs';

async function vkPublish() {
    const browser = await Browser.chrome();
    await browser.resizeWindow(1920, 1080)
    await browser.open('https://vk.com/animeenigma')

    try {
        const authBut = await browser.element(by.xpath(`//*[@id="quick_login"]/button[1]`))
        const phoneField = await browser.element(by.xpath(`//*[@id="index_email"]`))
        const authBut2 = await browser.element(by.xpath(`//*[@id="content"]/div[1]/form/button`))
        const anotherWay = await browser.element(by.xpath(`//*[@id="root"]/div/div/div/div/div[1]/div[1]/div/div/div/form/div[3]/button`))
        const passwordBut = await browser.element(by.xpath(`//*[@id="root"]/div/div/div/div/div[2]/div/div[2]/div/div/div/div/div[2]/div/div/div/div[3]`))
        const passwordField = await browser.element(by.xpath(`//*[@id="root"]/div/div/div/div/div[1]/div[1]/div/div/div/form/div[1]/div[3]/div/div/input`))
        const authPasswordBut = await browser.element(by.xpath(`//*[@id="root"]/div/div/div/div/div[1]/div[1]/div/div/div/form/div[2]/button[1]`))
        const clipsBut = await browser.element(by.xpath(`//*[@id="group_tabs"]/div/div[2]/div/ul/li[3]/a`))
        const publishBut = await browser.element(by.xpath(`//*[@id="group_tabs_content"]/div[3]/div[2]/a[1]`))
        const fileSelect = await browser.element(by.xpath(`//*[@name='video_file']`))
        const fileSelectBut = await browser.element(by.xpath(`//*[@id="video_upload_box_placeholder"]/div[1]/button`))

        await authBut.should(be.visible)
        await authBut.click()

        await phoneField.should(be.visible)
        await phoneField.setValue(`79089495068`)

        await authBut2.should(be.visible)
        await authBut2.click()

        await anotherWay.should(be.visible)
        await anotherWay.click()

        await passwordBut.should(be.visible)
        await passwordBut.click()

        await passwordField.should(be.visible)
        await passwordField.setValue(`egorka5616E`)

        await authPasswordBut.should(be.visible)
        await authPasswordBut.click()

        await clipsBut.should(be.visible)
        await clipsBut.click()

        await publishBut.should(be.visible)
        await publishBut.click()

        await fileSelectBut.should(be.visible)
        console.log(await fileSelect.getWebElement())
        console.log(await fileSelect.get())
        await browser.executeScript("arguments[0].style.visibility = 'visible';", await fileSelect.getWebElement());
        await fileSelect.setValue(`D:/projectt/ffmpegAnimeOpening/assets/results/2024-1-10_18-18-26.mp4`)
    } finally {
        // await browser.quit();
    }
}

await vkPublish()