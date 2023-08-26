# Botscope v2 Bot Performance Monitor

Bot Performance Monitor is a web-based tool designed to monitor the availability and uptime of specified URLs. Built using the Koa framework and axios library, this tool periodically checks the status of URLs, tracks their uptime, and responds to their availability.

## Features

- **Automated Monitoring**: The tool automatically checks the status of specified URLs at regular intervals.

- **Uptime Tracking**: The tool maintains a record of uptime for each monitored URL.

- **API for URL Addition**: Users can add URLs to the monitored list using an API endpoint.

- **Web Interface**: The web interface displays the status and uptime information of monitored URLs.

- **Error Handling**: Comprehensive error handling ensures smooth operation even in case of network errors or invalid URLs.

- **Graceful Deletion**: URLs experiencing prolonged downtime are gracefully deleted from the monitored list.

## Dependencies

- [axios](https://www.npmjs.com/package/axios): For making HTTP requests to monitor URLs.
- [koa](https://www.npmjs.com/package/koa): A lightweight web framework for creating the server.
- [koa-bodyparser](https://www.npmjs.com/package/koa-bodyparser): Middleware for parsing request bodies.
- [koa-json](https://www.npmjs.com/package/koa-json): Middleware for formatting JSON responses.
- [koa-router](https://www.npmjs.com/package/koa-router): Middleware for defining routes.
- [ejs](https://www.npmjs.com/package/ejs): Templating engine for rendering HTML.
- [moment-timezone](https://www.npmjs.com/package/moment-timezone): Library for handling timezones.

## Usage

1. Install dependencies using `npm install`.

2. Start the server using `npm start`.

3. Access the web interface to view monitored URLs and their status.

4. Add URLs to be monitored using the provided API endpoint.

## License

This project is licensed under the [MIT License](LICENSE).
