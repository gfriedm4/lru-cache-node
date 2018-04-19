const test = require('ava');
const Cache = require('./src/index');
const sleep = ms => new Promise(r => setTimeout(r, ms));

test('initializes a cache correctly', t => {
	const cache = new Cache(3);
	t.is(cache.limit, 3);
	t.is(cache.size, 0);
	t.is(typeof cache, 'object')
});

test('sets new keys in cache without expiry', t => {
	const cache = new Cache(3);

	cache.set("Sapiens", 5);
	t.is(Object.keys(cache.hashMap).length, 1);

	cache.set("Book Thief", 4);
	t.is(Object.keys(cache.hashMap).length, 2);

	cache.set("Catcher In The Rye", 0);
	t.is(Object.keys(cache.hashMap).length, 3);

	cache.set("Thus Spoke Zarathustra", 4);
	t.is(Object.keys(cache.hashMap).length, 3);
	t.is(cache.hashMap.Sapiens, undefined);
});

test('get key without expiry', async t => {
	const cache = new Cache(3);

	cache.set("Sapiens", 5);
	t.is(Object.keys(cache.hashMap).length, 1);

	cache.set("Book Thief", 4);
	t.is(Object.keys(cache.hashMap).length, 2);

	cache.set("Catcher In The Rye", 0);
	t.is(Object.keys(cache.hashMap).length, 3);

	await sleep(10);

	const sapiensRating = cache.get("Sapiens");
	t.is(sapiensRating, 5);

	cache.set("Thus Spoke Zarathustra", 4);
	t.is(Object.keys(cache.hashMap).length, 3);

	t.is(cache.hashMap.Sapiens.content.value, 5);
	t.is(cache.hashMap["Book Thief"], undefined);
});

test('sets with expiry', t => {
	const cache = new Cache(3, 10);

	cache.set("Sapiens", 5);
	t.is(cache.maxAge, 10);
	t.is(cache.hashMap.Sapiens.maxAge, 10);

	cache.set("Book Thief", 4, 7);
	t.is(cache.hashMap["Book Thief"].maxAge, 7);

	cache.set("Catcher In The Rye", 0);
	t.is(cache.hashMap["Catcher In The Rye"].maxAge, 10);
});

test('gets with expiry', async t => {
	const cache = new Cache(3, 10);
	cache.set("Sapiens", 5);
	const sapiens = cache.get("Sapiens");
	t.is(sapiens, 5);

	await sleep(3);
	const sapiensAfter3s = await cache.get("Sapiens");
	t.is(sapiensAfter3s, 5);

	await sleep(11);
	const sapiensAfter11s = await cache.get("Sapiens");
	t.is(sapiensAfter11s, null);
	t.is(cache.hashMap.Sapiens, undefined);

	cache.set("Book Thief", 4,  25);
	const bookThief = cache.get("Book Thief");
	t.is(bookThief, 4);

	await sleep(10);
	const bookThiefAfter10s = await cache.get("Book Thief");
	t.is(bookThiefAfter10s, 4);

	await sleep(10);
	const bookThiefAfter20s = await cache.get("Book Thief");
	t.is(bookThiefAfter20s, 4);

	await sleep(10);
	const bookThiefAfter30s = await cache.get("Book Thief");
	t.is(bookThiefAfter30s, 4);

	await sleep(30);
	const bookThiefAfter30sWithoutReset = await cache.get("Book Thief");
	t.is(bookThiefAfter30sWithoutReset, null);
});

test('stale', async t => {
	const cache = new Cache(3, 10, true);
	cache.set("Sapiens", 5);
	await sleep(11)
	t.is(cache.get("Sapiens"), 5);
	t.is(cache.get("Sapiens"), null);
	t.is(cache.hashMap.Sapiens, undefined);
});

test('peek', t => {
	const cache = new Cache(3);

	cache.set("Sapiens", 5);
	const sapiens = cache.peek("Sapiens");
	t.is(sapiens, 5);

	const test = cache.peek("test");
	t.is(test, null);

	cache.set("Book Thief", 4);
	cache.set("Catcher In The Rye", 0);
	cache.peek("test");
	cache.set("Thus Spoke Zarathustra", 4);
	t.is(cache.hashMap["Sapiens"], undefined);
});