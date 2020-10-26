# node-data-editor
a customizable data editor for node

# schema Description

```
{
  "title": "Book",
  "properties": {
    "id": {
      "type": "string"
    },
    "author": {
      "type": "string",
      "default" : "Peter"
    },
    "title: {
      "type: "string"
    }
  },
  "required": [
    "title"
  ],
  "links": [
    {
      "rel": "Pages",
      "href": "myapi/Pages?bookId={id}"
    }
  ]
}
```

# Development
* run `npm install`
* run `npm run dev` to start test server

# Unit Tests
* run `npm run test`

# Frontend Development
* see /frontend/ dir