const fs = require("fs");
const path = require("path");

/**
 * Info.plist 파일에서 버전 정보 읽기
 */
function readPlistVersion(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");

    // CFBundleShortVersionString 값 추출
    const versionMatch = content.match(
      /<key>CFBundleShortVersionString<\/key>\s*<string>(.*?)<\/string>/
    );
    const version = versionMatch ? versionMatch[1] : null;

    // CFBundleVersion 값 추출
    const buildMatch = content.match(
      /<key>CFBundleVersion<\/key>\s*<string>(.*?)<\/string>/
    );
    const build = buildMatch ? buildMatch[1] : null;

    return { version, build };
  } catch (error) {
    console.error(`Error reading plist file: ${error.message}`);
    return null;
  }
}

/**
 * AndroidManifest.xml 파일에서 버전 정보 읽기
 */
function readAndroidManifestVersion(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");

    // android:versionName 추출
    const versionNameMatch = content.match(/android:versionName="([^"]+)"/);
    const versionName = versionNameMatch ? versionNameMatch[1] : null;

    // android:versionCode 추출
    const versionCodeMatch = content.match(/android:versionCode="([^"]+)"/);
    const versionCode = versionCodeMatch ? versionCodeMatch[1] : null;

    return { versionName, versionCode };
  } catch (error) {
    console.error(`Error reading Android manifest file: ${error.message}`);
    return null;
  }
}

/**
 * GitHub Actions outputs에 값 작성
 */
function setGitHubOutput(name, value) {
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
  }
  console.log(`${name}=${value}`);
}

/**
 * 메인 실행 함수
 */
function main() {
  const rootDir = path.resolve(__dirname, "..");

  // iOS 버전 정보 읽기
  const plistPath = path.join(rootDir, "ios", "Info.plist");
  const iosVersion = readPlistVersion(plistPath);

  // Android 버전 정보 읽기
  const manifestPath = path.join(rootDir, "android", "AndroidManifest.xml");
  const androidVersion = readAndroidManifestVersion(manifestPath);

  // GitHub Actions outputs 설정
  if (iosVersion) {
    setGitHubOutput("ios_version", iosVersion.version);
  }

  if (androidVersion) {
    setGitHubOutput("android_version", androidVersion.versionName);
  }

  return {
    ios: iosVersion,
    android: androidVersion,
  };
}

// 스크립트 실행
if (require.main === module) {
  const versions = main();
  process.exit(0);
}

module.exports = {
  readPlistVersion,
  readAndroidManifestVersion,
};
