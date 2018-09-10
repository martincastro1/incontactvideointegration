# TokBox for InContact

This code provides the server and external client components of the TokBox integration for InContact. In order to complete setup of the integration, you will need to deploy this component to a server (this can be done quickly with the "Deploy to Heroku" button below). You will then need to add a custom action in your InContact Studio tool to allow MAXAgent users to launch the audio and video meetings.

## Quickly Deploy to Heroku

The fastest way to deploy this component is using the "Deploy to Heroku" button below. You will need a [Heroku account](https://heroku.com) (free tier available) and a [free TokBox account](https://tokbox.com/signup). After clicking, you will be asked to enter an API Key and Secret, which you can obtain by creating a standard project in your [TokBox Account Dashboard](https://tokbox.com/account).

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## Deploy to Your Own Server

This app was built with NodeJS, so it can be easily deployed on a server of your choice. When deploying, you will need to add your own TokBox API Key and Secret in the public/js/main.js file. If you don't already have an account, you can [sign up for a free trial](https://tokbox.com/signup).
