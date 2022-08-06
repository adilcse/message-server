const constants = require("../constants");
const { db } = require("../my-firebase");
const cheerio = require('cheerio');
const fs = require('fs');
const { textColorFromBackground } = require("./utils/Utils");
const dir = require('path').basename(__dirname)
const html = `${dir}/../public/index.html`;
const firebaseListener = () => {
console.log('Listening to theme changes');
return db.collection(constants.THEME_COLLECTION).doc(constants.THEME_DOC).onSnapshot(doc=> {
    if(doc.exists){
        const result = doc.data();
        const {banner, color} = result;
        if (banner && color) {
            let textColor = textColorFromBackground(color); 
            fs.readFile(html, 'utf8', function(err, data) {
                if (err) throw err;
                var $ = cheerio.load(data, null, false);
                $('#banner-image').attr('src', banner).html();
                $('header').attr('style', `border-color:${color};`).html();
                $('.next_button').attr('style', `background-color:${color}; color: ${textColor}`).html();
                fs.writeFile(html, $.html(),(error) => {
                    if (error) throw err;
                    console.log('Html file updated with color: '+color+' and banner: '+banner);
                })
            });
        }
    }
})
}

module.exports = firebaseListener;