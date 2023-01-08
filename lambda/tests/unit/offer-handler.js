'use strict';

const app = require('../../offer.js');
const fs = require('fs')
const chai = require('chai');
const expect = chai.expect;
const event = JSON.parse(fs.readFileSync('./../events/event.json'));
const emptyBody = JSON.parse(fs.readFileSync('./../events/emptyBody.json'));
const missingBody = JSON.parse(fs.readFileSync('./../events/missingBody.json'));
let context;

describe('Offer format', function () {
    it('response as object', async () => {
        const result = await app.offerHandler(event, context)

        expect(result).to.be.an('object');
        expect(result.body).to.be.an('string');

        let response = JSON.parse(result.body);

        expect(response).to.be.an('object');
    });
});

describe('Offer response', function () {
    it('200 ok', async () => {
        const result = await app.offerHandler(event, context)

        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(200);
        expect(result.body).to.be.an('string');

        let response = JSON.parse(result.body);

        expect(response).to.be.an('object');
        expect(response.total).to.be.equal(987.97);
    });

    it('add offers and get total', async () => {
        let body = JSON.parse(event.body)
        body.itemList = body.itemList.concat(', classic')
        event.body = JSON.stringify(body)

        const result = await app.offerHandler(event, context)

        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(200);
        expect(result.body).to.be.an('string');

        let response = JSON.parse(result.body);

        expect(response).to.be.an('object');
        expect(response.total).to.be.equal(1257.96);
    });
    
    //Empty Body without any offers
    it('Empty Body - 404 Offer Missing', async () => {
        const result = await app.offerHandler(emptyBody, context)

        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(404);
        expect(result.body).to.be.an('string');

        let response = JSON.parse(result.body);

        expect(response).to.be.an('object');
        expect(response.error).to.be.an('string');
        expect(response.error).to.be.equal('Offers missing');
    });

    //Missing Body in request
    it('Missing Body - 404 Offer Missing', async () => {
        const result = await app.offerHandler(missingBody, context)

        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(404);
        expect(result.body).to.be.an('string');

        let response = JSON.parse(result.body);

        expect(response).to.be.an('object');
        expect(response.error).to.be.an('string');
        expect(response.error).to.be.equal('Offers missing');
    });
});
