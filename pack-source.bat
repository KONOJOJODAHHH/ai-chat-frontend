@echo off
chcp 65001 >nul
echo ================================
echo 正在打包源代码项目...
echo ================================
echo.

REM 设置变量
set PROJECT_NAME=ai-chat-source
set OUTPUT_FILE=%PROJECT_NAME%.zip

REM 删除旧的打包文件
if exist %OUTPUT_FILE% (
    echo 删除旧的打包文件...
    del %OUTPUT_FILE%
)

echo.
echo 开始压缩文件...
echo 排除: node_modules, dist, .vite
echo.

REM 使用 PowerShell 压缩，排除不需要的文件夹
powershell -command "& {$files = Get-ChildItem -Path '.' -Exclude 'node_modules','dist','.vite','*.zip','pack-source.bat' | Where-Object {$_.Name -notmatch '^\.git$'}; Compress-Archive -Path $files -DestinationPath '%OUTPUT_FILE%' -Force}"

if exist %OUTPUT_FILE% (
    echo.
    echo ================================
    echo 打包完成！
    echo ================================
    echo.
    echo 输出文件: %OUTPUT_FILE%
    
    REM 显示文件大小
    for %%A in (%OUTPUT_FILE%) do (
        set size=%%~zA
        set /a sizeMB=!size! / 1048576
        echo 文件大小: !sizeMB! MB
    )
    
    echo.
    echo 你可以将这个 ZIP 文件分享给别人。
    echo.
    echo 别人收到后的使用步骤:
    echo 1. 解压 ZIP 文件
    echo 2. 进入项目文件夹
    echo 3. 运行: npm install
    echo 4. 运行: npm run dev
    echo 5. 访问: http://localhost:5173
    echo.
) else (
    echo.
    echo 打包失败！
)

pause
