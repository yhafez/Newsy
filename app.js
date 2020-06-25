/*-------------------------------------------------------------------Global Variables-------------------------------------------------------------------*/

const doc = $(document);
const app = $('#app');
const state = [];

const API_URL = 'https://api.currentsapi.services/v1';
const API_KEY = 'h8Wd2xeRh2Y7A9LW9J83UyuNIO1YwMMsCggDH-priqQo6kGf'
const NEWS_STR = 'latest-news';
const SEARCH_STR = 'search';
let langString = 'en'; //sets English as default language
let regString = 'US'; //sets US as default region
const BASE_SEARCH = `${API_URL}/${SEARCH_STR}?apiKey=${API_KEY}&language=${langString}&country=${regString}`



async function fetchJson (url) {
    try {
        const response = await fetch(encodeURI(url));
        console.log(response);
        const data = await response.json();
        console.log(data);
        return data;
    }
    catch (err) {
        console.error(`Oh no! You've encountered an error fetching objects from ${url}! Error: ${err}`);
      }
}


/*----------------------------------------------------------------------- Functions -----------------------------------------------------------------------*/


async function fetchLangs() {

    const langUrl = `${API_URL}/available/languages`

    if (localStorage.getItem('langs')) {return JSON.parse(localStorage.getItem('langs'));}
    else {
        try {
            const {languages} = await fetchJson(langUrl);
            localStorage.setItem('langs', JSON.stringify(languages));
            return languages;
        }
        catch (err) {console.error("Oh no! You've encountered an error fetching languages. Error: " + err);}
    }
}


async function fetchRegions() {

    const regionsUrl = `${API_URL}/available/regions`

    if (localStorage.getItem('regions')) {return JSON.parse(localStorage.getItem('regions'));}
    else {
        try {
            const {regions} = await fetchJson(regionsUrl);
            localStorage.setItem('regions', JSON.stringify(regions));
            return regions;
        }
        catch (err) {console.error("Oh no! You've encountered an error fetching regions. Error: " + err);}
    }
}


async function fetchCategories() {

    const categoryUrl = `${API_URL}/available/categories`

    if (localStorage.getItem('categories')) {return JSON.parse(localStorage.getItem('categories'))}
    else {
        try {
            const {categories} = await fetchJson(categoryUrl);
            categories.unshift('Any'); //add "Any" category
            categories.splice(categories.indexOf('notsure'), 1); //remove "notsure" from category options
            localStorage.setItem('categories', JSON.stringify(categories));
            return categories;
        }
        catch (err) {console.error("Oh no! You've encountered an error fetching categories. Error: " + err);}
    }
}


async function prefetchDropdowns() {

    function buildDropdown(val, name) {return $(`<option value =${val}>${name}</option>`)}

    try{
        const [ languages, regions, categories ] = await Promise.all([fetchLangs(), fetchRegions(), fetchCategories()])
    
        for (let language in languages) {$('#language').append(buildDropdown(languages[language], language))}
        for (let region in regions) {$('#region').append(buildDropdown(regions[region], region))}
        for (let category of categories) {$('#category').append(buildDropdown(category, category))}
    }
    catch(err) {console.error("Oh no! You've encountered an error prefetching dropdown items! Error: " + err)}
    

}


function buildAllNewsCards (newsArr) {

    $('#results').empty();
    for (let newsObj of newsArr) {
        const newsCard = buildNewsCards(newsObj);
        $('#results').append(newsCard);
    }

}


function buildNewsCards ({title, category, url, author, published, image, description}) {
    
    let categ = '';
    category.forEach( (elem) => {
        if (categ.length === 0){ categ = `<span class="card-cat-text">${ elem }</span>` }
        else { categ = `<span class="card-cat-text">${ elem }</span>` + '; ' + categ }
    })
    
    const month = (new Date(published).getMonth() + 1).toString();
    const year = new Date(published).getFullYear().toString();
    const day = new Date(published).getDate().toString();
    const date = `${month}/${day}/${year}`
    // const thumbnail = image === 'None' ? '' : image
    const thumbnail = image === ('None' || '/') ? '' : `<a href=${ image }><img target='_blank' class='card-image' src=${ image } alt='Image no longer available 😱'/></a>`


    const newsCard = $(`
    <div class='news-card'>
        <div class='card-head'>
            <h2 class='news-title'><a target='_blank' href='${ url }'>${ title }</a></h2>
            <div class='card-sub'>
                <h3 class='card-author'>By ${ author }</h3>
                <hr>
                <h3 class ='card-date'>Published on ${ date }</h3>
            </div>
        </div>
        ${ thumbnail }
        <p class='card-description'>${ description }</p>
        <p class='card-category'>Category: <span class="card-cat-text">${ categ }</span></p>
    </div>
    `)
    $('#results').append(newsCard);
    return newsCard;

}


function defaultInfoRequest() {

    if (localStorage.getItem('default-lang') && localStorage.getItem('default-region')) {
        $('#default-preferences').css('display', 'none');
        langString = JSON.parse(localStorage.getItem('default-lang'));
        regString = JSON.parse(localStorage.getItem('default-region'));
    }
    else if (localStorage.getItem('default-region')) {
        $('#default-preferences').css('display', 'none');
        regString = JSON.parse(localStorage.getItem('default-region'));
    } else if (localStorage.getItem('default-lang')) {
        $('#default-preferences').css('display', 'none');
        langString = JSON.parse(localStorage.getItem('default-lang'));
    }
    else {
        $('#default-preferences').css('display', 'initial');
    }

}
 

async function buildNewsDefault() {
    
    const latestNews = `${API_URL}/${NEWS_STR}?apiKey=${API_KEY}&language=${langString}&country=${regString}`

    if (localStorage.getItem('news')) {
        return JSON.parse(localStorage.getItem('news'));
    }
    else {
        try {
            const {news} = await fetchJson(latestNews);
            console.log(news);
            localStorage.setItem('news', JSON.stringify(news));
            // const totalPages = await getTotalPages(latestNews);
            // localStorage.setItem('latest-news-pages', totalPages);
            // console.log(totalPages);
            return news;
        }
        catch (err) {
            console.error("Oh no! You've encountered an error fetching the default news. Error: " + err);
        }
    }
}


async function buildKeySearch(string) {

    const keySearchUrl = `${BASE_SEARCH}&keywords=${string}`;
    
    try {
        const response = await fetchJson(keySearchUrl);
        return response;
    } catch (err) {
        console.error("Oh no! You've encountered an error building a key search. Error: " + err)
    }
}


async function buildCategorySearch(str) {

    const categorySearchUrl = `${BASE_SEARCH}&category=${str}`
    console.log(categorySearchUrl);

    try {
    const response = await fetchJson(categorySearchUrl);
    return response;
    } catch (err) {
        console.error("Oh no! You've encountered an error building a category search. Error: " + err)
    }
}


//Group of function to build url for advanced search query
function addKeywordStr(base, keywords) {return base + `&keywords=${ keywords }`}
function addStartDateStr(base, date) {return base + `&start_date=${ date }T01:00:00.000+00:00`}
function addEndDateStr(base, date) {return base + `&end_date=${ date }T01:00:00.000+00:00`}
function addDomainIsStr(base, domain) {return base + `&domain=${ domain }`}
function addDomainIsNotStr(base, domain) {return base + `&domain_not=${ domain }`}
function addCategoryStr(base, category) {return base + `&category=${ category }`}


async function getTotalPages(url) {
    let pageNum = 1;
    let count = 1;
    let searchUrl = `${url}&page_number=${ pageNum + 1 }`

    while (await fetchJson(searchUrl)) {
        pageNum++;
        count++;
    }
    return count;
}


//Displays loading screen
function onFetchStart() {
    $('#loading').css('display', 'initial');
    $('#loading').addClass('active');
}
  
  
//Hides loading screen
function onFetchEnd() {
$('#loading').removeClass('active');
$('#loading').css('display', 'none');
}


function bootstrap () {
    doc.ready(async () => {
        try {
            await prefetchDropdowns();
            langString = $('#language').val();
            regString = $('#region').val();
            defaultInfoRequest();
        }  catch (err) {
            console.error("Oh no! You've encountered an error bootstrapping. Error: " + err)
        }
    });
}


/*-------------------------------------------------------------------- Event Handlers --------------------------------------------------------------------*/


//Click handler to enable submit button for default preferences form
$('#def-pref-submit').click((event) => {
    event.preventDefault();
    langString = $('#language').val();
    regString = $('#region').val();
    localStorage.setItem('default-lang', JSON.stringify(langString));
    localStorage.setItem('default-region', JSON.stringify(regString));
    $('#default-preferences').css('display', 'none');
})


//Click handler to activate "advanced search" option
$('#adv-link').click(() => {
    $('#basic-search').css('display', 'none');
    $('#adv-div').css('display', 'block');
})


//Click handler to activate "basic search" option
$('#basic-link').click(() => {
    $('#adv-div').css('display', 'none');
    $('#basic-search').css('display', 'block');
})


//Click handler for gear icon (for adjusting default language and region preferences)
$('#gear').click(() => {
    $('#default-preferences').css('display', 'initial');
})


//Clik handler for search button in basic search
$('#basic-submit').click(async (event) => {
    
    event.preventDefault();
    onFetchStart();

    $('#welcome').css('display','none');
    $('#sub-heading').css('display','none');
    $('#basic-submit').css('border-color', 'rgba(255,255,255, 60%)');
    $('#adv-div').css('box-shadow', '0 0 8px rgba(255,255,255, 60%)');
    $('#forward').css('display', 'initial');
    $('#back').css('display', 'initial');
    $('#home').css('display', 'initial');
    $('header').css({
        'background-color': 'rgba(219,177,59)',
        'box-shadow': '0 0 18px rgba(90,183,167, 90%)'
    });
    $('#logo').css({
        'width': 'calc(5rem + 17vw)',
        'display': 'initial',
        'margin-right': 'auto',
        'margin-left': 'auto'
    });
    
    try {
        if ($('.search').val() === '') {
            const defaultNews = await buildNewsDefault();
            buildAllNewsCards(defaultNews);
            const totalPages = getTotalPages();
            onFetchEnd();
        } else {
            const {news} = await buildKeySearch($('.search').val());
            console.log(news);
            buildAllNewsCards(news);
            onFetchEnd();
        }
    } catch (err) {
        console.error("Oh no! You've encountered an error running a basic search. Error: " + err);
        onFetchEnd();
    }
})


//Adds styling to categories in search results on hover
$('#app').on('mouseenter', '.card-cat-text', (event) => {
    $(event.target).css({
        'color': 'blue',
        'text-decoration': 'underline',
        'cursor': 'pointer'
    })
})


//Remove styling from categories in search results on hover-leave
$('#app').on('mouseleave', '.card-cat-text', (event) => {
    $(event.target).css({
        'color': 'grey',
        'text-decoration': 'none',
        'cursor': 'pointer'
    })
})


//Run new category search when category clicked in search result
$('#app').on('click', '.card-cat-text', async (event) => {
    onFetchStart();
    const category = $(event.target).text();
    try{
        const {news} = await buildCategorySearch(category);
        console.log(news);
        buildAllNewsCards(news);
        onFetchEnd();
    } catch (err) {
        console.error("Oh no! You've encountered an error running a new category search from results. Error: " + err);
        onFetchEnd();
    }
})


//Click handler for "Home" button
$('#home').click(() => {

    $('#results').empty();
    $('#welcome').css('display','block');
    $('#sub-heading').css('display','initial');
    $('#adv-div').css('box-shadow', '0 0 8px rgba(219,177,59, 95%)');
    $('#forward').css('display', 'none');
    $('#back').css('display', 'none');
    $('#home').css('display', 'none');
    $('#logo').css('width', 'calc(5rem + 50vw)');
    $('#logo').css('display','block');
    $('#basic-submit').css('border-color', 'rgba(219,177,59, 95%)');
    $('header').css({
        'background-color': 'transparent',
        'box-shadow': 'none'
    });

})


//Click handler for search button in advanced search
$('#adv-submit').click(async (event) => {
    
    event.preventDefault();
    onFetchStart();

    $('#welcome').css('display','none');
    $('#sub-heading').css('display','none');
    $('#basic-submit').css('border-color', 'rgba(255,255,255, 60%)');
    $('#adv-div').css('box-shadow', '0 0 8px rgba(255,255,255, 60%)');
    $('#forward').css('display', 'initial');
    $('#back').css('display', 'initial');
    $('#home').css('display', 'initial');
    $('header').css({
        'background-color': 'rgba(219,177,59)',
        'box-shadow': '0 0 18px rgba(90,183,167, 90%)'
    });
    $('#logo').css({
        'width': 'calc(5rem + 17vw)',
        'display': 'initial',
        'margin-right': 'auto',
        'margin-left': 'auto'
    });
    
    try {
        if ($('#adv-search').val() === '' && $('#start-date').val() === '' && $('#end-date').val() === '' && $('#domain-is').val() === '' && $('#domain-not').val() === '' && $('#category').val() != 'Any') {
            const defaultNews = await buildNewsDefault();
            buildAllNewsCards(defaultNews);
            onFetchEnd();
        } else {

            let advSearchUrl = `${BASE_SEARCH}`

            if ($('#adv-search').val() != '') {
                const keywords = $('#adv-search').val();
                advSearchUrl = addKeywordStr(advSearchUrl, keywords);
            }
            if ($('#start-date').val() != '') {
                const startDate = $('#start-date').val();
                advSearchUrl = addStartDateStr(advSearchUrl, startDate);
            }
            if ($('#end-date').val() != '') {
                const endDate = $('#end-date').val();
                advSearchUrl = addEndDateStr(advSearchUrl, endDate);
            }
            if ($('#domain-is').val() != '') {
                const domainIs = $('#domain-is').val();
                advSearchUrl = addDomainIsStr(advSearchUrl, domainIs);
            }
            if ($('#domain-not').val() != '') {
                const domainNot = $('#domain-not').val();
                advSearchUrl = addDomainIsNotStr(advSearchUrl, domainNot);
            }
            if ($('#category').val() != 'Any') {
                const category = $('#category').val();
                advSearchUrl = addCategoryStr(advSearchUrl, category);
            }
        console.log(advSearchUrl);
        const news = await fetchJson(advSearchUrl);
        console.log(news);
        buildAllNewsCards(news);
        onFetchEnd();
        }
    } catch (err) {
        console.error("Oh no! You've encountered an error running a basic search. Error: " + err);
        onFetchEnd();
    }
})



/*-------------------------------------------------------------------- Runtime Code --------------------------------------------------------------------*/

bootstrap();