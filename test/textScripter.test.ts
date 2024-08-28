// import { ImportMock } from 'ts-mock-imports';
import TextScripter from '../src/textScripter';
const assert = require('assert');

describe('Hello World Test', function() {
    it('should return Hello World', function() {
        const sut = new TextScripter();
        const result = sut.helloWorld();
        assert.equal(result, 'Hello World');
    });
});

