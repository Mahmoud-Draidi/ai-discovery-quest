// Archived-course regression navigation uses real visible links in the new journey.
async function earlierHome(page){
 const home=page.locator('[data-view="home"]');if(await home.isVisible())await home.click();
 let link=page.locator('[data-action="legacy-home"]').first();
 if(await link.count()){if(!await link.isVisible())await page.locator('details').filter({has:link}).locator('summary').first().click();await link.click();return;}
 await page.locator('[data-action="course"]').first().click();await page.locator('[data-action="legacy-course"]').click();await page.locator('[data-action="legacy-home"]').click();
}
async function earlierCourse(page){const nav=page.locator('[data-view="lesson"]');if(await nav.isVisible())await nav.click();else await page.locator('[data-action="course"]').first().click();await page.locator('[data-action="legacy-course"]').click();}
async function earlierGuide(page){await page.locator('[data-view="guide"]').click();await page.locator('[data-action="legacy-guide"]').click();}
module.exports={earlierHome,earlierCourse,earlierGuide};
