#!/bin/bash

# Deep Link Testing Script
# Usage: ./scripts/test-deep-links.sh [platform] [link_type] [route]

PLATFORM=${1:-android}
LINK_TYPE=${2:-custom}
ROUTE=${3:-home}

PACKAGE_NAME="com.mvpnotification"
CUSTOM_SCHEME="mvpnotification://"
UNIVERSAL_LINK="https://mvpnotification.app"

echo "Testing Deep Links"
echo "=================="
echo "Platform: $PLATFORM"
echo "Link Type: $LINK_TYPE"
echo "Route: $ROUTE"
echo ""

if [ "$PLATFORM" = "android" ]; then
    if [ "$LINK_TYPE" = "custom" ]; then
        URL="${CUSTOM_SCHEME}${ROUTE}"
        echo "Testing: $URL"
        adb shell am start -W -a android.intent.action.VIEW -d "$URL" $PACKAGE_NAME
    elif [ "$LINK_TYPE" = "universal" ]; then
        URL="${UNIVERSAL_LINK}/${ROUTE}"
        echo "Testing: $URL"
        adb shell am start -W -a android.intent.action.VIEW -d "$URL" $PACKAGE_NAME
    else
        echo "Invalid link type. Use 'custom' or 'universal'"
        exit 1
    fi
elif [ "$PLATFORM" = "ios" ]; then
    if [ "$LINK_TYPE" = "custom" ]; then
        URL="${CUSTOM_SCHEME}${ROUTE}"
        echo "Testing: $URL"
        xcrun simctl openurl booted "$URL"
    elif [ "$LINK_TYPE" = "universal" ]; then
        URL="${UNIVERSAL_LINK}/${ROUTE}"
        echo "Testing: $URL"
        xcrun simctl openurl booted "$URL"
    else
        echo "Invalid link type. Use 'custom' or 'universal'"
        exit 1
    fi
else
    echo "Invalid platform. Use 'android' or 'ios'"
    exit 1
fi

echo ""
echo "Test completed!"

