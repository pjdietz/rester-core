/* jshint node: true, mocha: true */
"use strict";

var assert = require("chai").assert,
    expect = require("chai").expect;

var Parser = require("../lib/parser").Parser;

describe("Parser", function () {

    describe("Construction", function () {
        it("Creates instance with default options", function () {
            var parser = new Parser();
            assert(parser !== undefined);
        });
    });

    describe("Request line", function () {

        var requests = [
            {
                description: "No method, URI",
                request: "http://localhost/dogs",
                method: "GET",
                protocol: "http:",
                auth: null,
                host: "localhost",
                hostname: "localhost",
                port: null,
                path: "/dogs"
            },
            {
                description: "No method, URI with port",
                request: "http://localhost:8080/dogs?name=bear",
                method: "GET",
                protocol: "http:",
                auth: null,
                host: "localhost:8080",
                hostname: "localhost",
                port: "8080",
                path: "/dogs?name=bear"
            },
            {
                description: "Method, path only",
                request: "POST /cats",
                method: "POST",
                protocol: null,
                auth: null,
                host: null,
                hostname: null,
                port: null,
                path: "/cats"
            },
            {
                description: "Blank lines at start",
                request: ["", "   ", "PUT /hamsters"].join("\n"),
                method: "PUT",
                protocol: null,
                auth: null,
                host: null,
                hostname: null,
                port: null,
                path: "/hamsters"
            },
            {
                description: "Method, path, and version",
                request: "OPTIONS /guinea-pigs HTTP/1.1",
                method: "OPTIONS",
                protocol: null,
                auth: null,
                host: null,
                hostname: null,
                port: null,
                path: "/guinea-pigs"
            },
            {
                description: "Authority",
                request: "DELETE https://fry:secret@mydomain.com/cats",
                method: "DELETE",
                protocol: "https:",
                auth: "fry:secret",
                host: "mydomain.com",
                hostname: "mydomain.com",
                port: null,
                path: "/cats"
            },
        ];

        describe("Parses method", function () {
            requests.forEach(function (test) {
                it(test.description, function (done) {
                    var parser = new Parser();
                    parser.parse(test.request, function (error, options, body) {
                        expect(options.method).to.equal(test.method);
                        done();
                    });
                });
            });
        });

        describe("Parses protocol", function () {
            requests.forEach(function (test) {
                it(test.description, function (done) {
                    var parser = new Parser();
                    parser.parse(test.request, function (error, options, body) {
                        expect(options.protocol).to.equal(test.protocol);
                        done();
                    });
                });
            });
        });

        describe("Parses auth", function () {
            requests.forEach(function (test) {
                it(test.description, function (done) {
                    var parser = new Parser();
                    parser.parse(test.request, function (error, options, body) {
                        expect(options.auth).to.equal(test.auth);
                        done();
                    });
                });
            });
        });

        describe("Parses host", function () {
            requests.forEach(function (test) {
                it(test.description, function (done) {
                    var parser = new Parser();
                    parser.parse(test.request, function (error, options, body) {
                        expect(options.host).to.equal(test.host);
                        done();
                    });
                });
            });
        });

        describe("Parses hostname", function () {
            requests.forEach(function (test) {
                it(test.description, function (done) {
                    var parser = new Parser();
                    parser.parse(test.request, function (error, options, body) {
                        expect(options.hostname).to.equal(test.hostname);
                        done();
                    });
                });
            });
        });

        describe("Parses port", function () {
            requests.forEach(function (test) {
                it(test.description, function (done) {
                    var parser = new Parser();
                    parser.parse(test.request, function (error, options, body) {
                        expect(options.port).to.equal(test.port);
                        done();
                    });
                });
            });
        });

        describe("Parses path", function () {
            requests.forEach(function (test) {
                it(test.description, function (done) {
                    var parser = new Parser();
                    parser.parse(test.request, function (error, options, body) {
                        expect(options.path).to.equal(test.path);
                        done();
                    });
                });
            });
        });

    }); // Request line

    describe("Headers, query, and options", function () {

        var request = [
            "POST http://mydomain.com/cats",
            "Host: localhost",
            "Cache-control: no-cache",
            "Content-type: application/json",
            "# This is a comment",
            "@flag",
            "@followRedirects: true",
            "@redirectStatusCodes: [301, 302]",
            "@redirectLimit: 5",
            "@stringOption: \"stringValue\"",
            "@unquotedStringOption: stringValue",
            "",
            "{\"name\": \"molly\"}",
            ""
        ].join("\n");

        it("Parses headers", function (done) {
            var parser = new Parser();
            parser.parse(request, function (error, options, body) {
                var header, headers = {
                    "Host": "localhost",
                    "Cache-control": "no-cache",
                    "Content-type": "application/json",
                };
                for (header in headers) {
                    expect(options.headers[header]).to.equal(headers[header]);
                }
                done();
            });
        });

        describe("Parses options", function () {

            it("Parses flag options", function (done) {
                var parser = new Parser();
                parser.parse(request, function (error, options, body) {
                    expect(options.flag).to.be.a("boolean");
                    expect(options.flag).to.equal(true);
                    done();
                });
            });

            it("Parses boolean options", function (done) {
                var parser = new Parser();
                parser.parse(request, function (error, options, body) {
                    expect(options.followRedirects).to.be.a("boolean");
                    expect(options.followRedirects).to.equal(true);
                    done();
                });
            });

            it("Parses number options", function (done) {
                var parser = new Parser();
                parser.parse(request, function (error, options, body) {
                    expect(options.redirectLimit).to.be.a("number");
                    expect(options.redirectLimit).to.equal(5);
                    done();
                });
            });

            it("Parses array options", function (done) {
                var parser = new Parser();
                parser.parse(request, function (error, options, body) {
                    expect(options.redirectStatusCodes).to.be.a("array");
                    expect(options.redirectStatusCodes).to.have.length(2);
                    expect(options.redirectStatusCodes).to.include(301);
                    expect(options.redirectStatusCodes).to.include(302);
                    done();
                });
            });

            it("Parses string options with quotes", function (done) {
                var parser = new Parser();
                parser.parse(request, function (error, options, body) {
                    expect(options.stringOption).to.be.a("string");
                    expect(options.stringOption).to.equal("stringValue");
                    done();
                });
            });

            it("Parses string options without quotes", function (done) {
                var parser = new Parser();
                parser.parse(request, function (error, options, body) {
                    expect(options.unquotedStringOption).to.be.a("string");
                    expect(options.unquotedStringOption).to.equal("stringValue");
                    done();
                });
            });

        }); // Options

    });

});
