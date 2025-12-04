const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push("ogg", "mp3", "m4a", "wav", "flac", "aac", "wma", "opus", "amr", "3gp", "mp4", "m4p");

module.exports = config;

