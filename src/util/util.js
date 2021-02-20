export function resolve(...urls) {
  let newUrl = "",isFolder = false;

  const tmp = urls[urls.length - 1];

  if(typeof tmp === 'boolean') {
    isFolder = urls.pop();
  }

  for (let url of urls) {
    if (!url) {
      continue;
    }

    url = String(url);

    if (url === urls[0]) {
      newUrl = url + "";
      continue;
    }

    newUrl = lastCharSprit(newUrl) + (url.startsWith("/") ? "" : "/") + url;
  }

  // 判断最后一个字符串是否是斜杠
  function lastCharSprit(char, isAddSlash) {
    let newChar = char;
    if (char.lastIndexOf("/") === char.length - 1) {
      newChar = char.substr(0, char.length - 1);
    }

    if (isAddSlash) {
      newChar += "/";
    }

    return newChar;
  }

  return lastCharSprit(newUrl, isFolder);
}
