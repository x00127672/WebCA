// This is the Link API
import Link from 'next/link';
import fetch from 'isomorphic-unfetch';
import SearchForm from '../components/SearchForm';
import App from '../components/Dropdown';

const apiKey = 'b379d975659c41319eb0ae5e9e0bfc14';

// Initial News source
const defaultNewsSource = 'new-scientist';
// Pass this content as 'props' to child components
async function getNews(url) {

  // try fetch and catch any errors
  try {
    // Make async call
    const res = await fetch(url);
    // get json data when it arrives
    const data = await res.json();
    // return json data
    return (data);
  } catch (error) {
    // return error if it occurs
    return (error);
  }
}

//
//  The News page defined as an ES6 Class
//
export default class News extends React.Component {

  // Constructor
  // Recieve props and initialise state properties
  constructor(props) {
    super(props)
    this.state = {
      newsSource: "",
      url: "",
      articles: []
    }
  }
  // This function is passed to the SearchForm and used the get the value entered
  // This value will be used to generate the api url
  setNewsSource = (input) => {
    this.setState({
      newsSource: input,
      url: `https://newsapi.org/v2/top-headlines?sources=${input}&apiKey=${apiKey}`
    })
  }

  // Get all articles by searching for keyword(s)
  // https://newsapi.org/docs/endpoints/
  //
  searchNewsAPI = (event) => {
    // set state values - this will trigger an update and componentDidUpdate
    this.setState({
      // Get the link text
      newsSource: `${event.target.innerText}`,
      // Build the search URL using the link name
      url: `https://newsapi.org/v2/${event.target.name}&apiKey=${apiKey}`
    })
    console.log(this.state.url);
  }

  //
  // render() method generates the page
  //
  render() {

    // if state.articles is empty copy props to it
    if (this.state.articles.length == 0) {
      this.state.articles = this.props.articles;
    }
    return (
      <div>
        { /* Add the SearchForm component */}
        { /* Pass the setNewsSource function as a prop with the same name*/}
        <SearchForm setNewsSource={this.setNewsSource} />

        { /* Example search links - note using name attribute for parameters(!!) */}
        <ul className="newsMenu">
          <li><a href="#" onClick={this.searchNewsAPI} name="top-headlines?country=ie&category=science">Science News Ireland</a></li>
          <li><a href="#" onClick={this.searchNewsAPI} name="top-headlines?country=gb&category=science">Science News UK</a></li>
          <li><a href="#" onClick={this.searchNewsAPI} name="top-headlines?country=us&category=science">Science News US</a></li>
        </ul>
        { /* Display a title based on source */}
        <h2>{this.state.newsSource.split("-").join(" ")}</h2>
        <div>
          { /* Iterate through articles using Array map) */}
          { /* Display author, publishedAt, image, description, and content */}
          { /* for each story. Also a link for more.. */}
          { /* the map index property gives the position in the array for each article - see the link below */}
          {this.state.articles.map((article, index) => (
            <section key={index}>
              <h3>{article.title}</h3>
              <p className="author">{article.author} {article.publishedAt}</p>
              <img src={article.urlToImage} alt="article image" className="img-article"></img>
              <p>{article.description}</p>
              <p>{article.content}</p>
              { /* adding the index value as a paramater to be passed with a request for the single article page*/}
              <p><Link as={`/article/${index}`} href={`/article?id=${index}`}><a>Read More</a></Link></p>
            </section>
          ))}
        </div>

        <style jsx>{`
              /* CSS for this page */
              section {
                width: 50%;
                border: 1px solid gray;
                background-color: rgb(183, 194, 204);
                padding: 1em;
                margin: auto;
              }
              h2{
                max-width: 250px;
                margin: auto;
              }
            .author {
                font-style: italic;
                font-size: 0.8em;
              }
            .img-article {
                max-width: 50%;
              }

              .newsMenu {
                display: flex;
                background: #f0f0f0;
                border: 1px solid #ccc;
                flex-direction: row;
                margin: 0;
                padding: 0;
                margin-top: 20px;
              }
              .newsMenu li {
                display: inline-table;
                list-style: none;
                float: left;
                flex-grow: 1;
                text-align: center;
                border-left: 1px solid #fff;
                border-right: 1px solid #ccc;
                width: 16.6667%; /* fallback for non-calc() browsers */
                width: calc(100% / 6);
                box-sizing: border-box;
              }
  
              .newsMenu li a {
                font-size: 0.8em;
                display: block;
                text-decoration: none;
                color: #616161;
                padding: 5px 0;
              }
  
              .newsMenu li a:hover {
                color: rgb(255, 187, 0);
                text-decoration: underline;
              }
          `}</style>
      </div>
    );
  }

  //
  // Get initial data on server side using an AJAX call
  // This will initialise the 'props' for the News page
  //    
  static async getInitialProps(response) {

    // Build the url which will be used to get the data
    // See https://newsapi.org/s/the-irish-times-api
    const defaultUrl = `https://newsapi.org/v2/top-headlines?sources=${defaultNewsSource}&apiKey=${apiKey}`;

    // Get news data from the api url
    const data = await getNews(defaultUrl);

    // If the result contains and articles array then it is good so return articles
    if (Array.isArray(data.articles)) {
      return {
        articles: data.articles
      }
    }
    // Otherwise it contains an error, log and redirect to error page (status code 400)
    else {
      console.error(data)
      if (response) {
        response.statusCode = 400
        response.end(data.message);
      }
    }
  }

  // componentDidUpdate is called when the page state or props re updated
  // It can be over-ridden to perform other functions when an update occurs
  // Here it fetches new data using this.state.newsSource as the source
  async componentDidUpdate(prevProps, prevState) {

    // Check if newsSource url has changed to avoid unecessary updates 
    if (this.state.url !== prevState.url) {

      // Use api url (from state) to fetch data and call getNews()
      const data = await getNews(this.state.url);

      // If the result contains and articles array then it is good so update articles
      if (Array.isArray(data.articles)) {
        // Store articles in state
        this.state.articles = data.articles;
        // Force page update by changing state (make sure it happens!)
        this.setState(this.state);
      }
      // Otherwise it contains an error, log and redirect to error page (status code 400)
      else {
        console.error(data)
        if (response) {
          response.statusCode = 400
          response.end(data.message);
        }
      }
    }
  } // End componentDidUpdate



} // End class


