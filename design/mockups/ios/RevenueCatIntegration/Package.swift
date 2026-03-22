// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "RevenueCatIntegration",
    platforms: [
        .iOS(.v16),
        .macOS(.v12),
    ],
    products: [
        .library(
            name: "RevenueCatIntegration",
            targets: ["RevenueCatIntegration"]
        ),
    ],
    dependencies: [
        // RevenueCat iOS SDK via Swift Package Manager
        .package(
            url: "https://github.com/RevenueCat/purchases-ios-spm.git",
            .upToNextMajor(from: "5.0.0")
        ),
    ],
    targets: [
        .target(
            name: "RevenueCatIntegration",
            dependencies: [
                .product(name: "RevenueCat", package: "purchases-ios-spm"),
                .product(name: "RevenueCatUI", package: "purchases-ios-spm"),
            ]
        )
    ]
)

