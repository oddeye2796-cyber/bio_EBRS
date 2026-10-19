"""src/ 의 화면 명세·스크립트·번역을 하나의 HTML 파일로 묶는다: python3 build.py"""
import json, os, re
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), "src")
rd = lambda n: open(os.path.join(D, n), encoding="utf-8").read()
J = lambda o: json.dumps(o, ensure_ascii=False).replace("</", "<\\/")
html = (rd("template.html")
        .replace("__SPEC__", J(json.loads(rd("screen_spec.json"))))
        .replace("__I18N__", J(json.loads(rd("i18n.json"))))
        .replace("__ICONS__", J(json.loads(rd("icons.json"))))
        .replace("__APP__", rd("app.js")))
out = os.path.join(os.path.dirname(D), "index.html")
open(out, "w", encoding="utf-8").write(html)
print(out, len(html), "banned:", re.findall(r"(?i)sk ?바이오|sk ?bio|skbt|\bSK\b", html))
