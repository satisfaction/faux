# Faux

Faking Ajax calls

## Installation

```
bower install https://github.com/satisfaction/faux.git
```

## Usage

### Mocking an Ajax Call

```javascript
var mock = faux.get(/\/conversations\/search/).reply({
  total: 1,
  total_pages: 1,
  current_page: 1,
  models: [{
    created_at: '2014-10-09T02:38:27Z',
    title: 'Lorem ipsum dolor sit amet',
    description: 'Nullam vitae diam scelerisque augue pharetra ultrices.'
  }]
});
```
### Removing a Mock

```javascript
mock.restore();
```

### Simulating Network Latency

```javascript
mock.delay(1000); // 1 second
```
