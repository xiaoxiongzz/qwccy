const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const PORT = 3006;

const corsOptions = {
    origin: ['https://telegram.welikescwl.top', 'https://192.168.0.142:5173', 'http://192.168.0.142:5173/qwccy'], // 允许的域名列表
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // 允许的 HTTP 方法
    allowedHeaders: ['Content-Type', 'Authorization'], // 允许的请求头
    credentials: true, // 允许发送凭证（如 cookies）
    optionsSuccessStatus: 200 // 对于旧版浏览器的支持
};
app.use(cors(corsOptions));
app.use(express.json());

// 添加自定义的错误处理中间件
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ error: '无效的 JSON 格式', details: err.message });
    }
    next();
});

// 创建连接池而不是单个连接
const pool = mysql.createPool({
    host: '107.172.20.179',
    user: 'game',
    password: '115268.zz',
    database: 'qwccy',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();

// 封装查询函数
async function query(sql, params) {
    try {
        const [results] = await pool.query(sql, params);
        console.log("数据库连接成功");
        return results;
    } catch (error) {
        console.error('数据库查询出错:', error);
        throw error;
    }
}

// 更新 Twitter 分享数据的接口
app.put('/api/twitter-share-data', async (req, res) => {
    const { tweetUrl, shareText, hashtags } = req.body;

    if (!tweetUrl || !shareText || !hashtags) {
        return res.status(400).json({ error: '所有字段都是必填的' });
    }

    try {
        const result = await query(
            'UPDATE tweet SET tweetUrl = ?, shareText = ?, hashtags = ?',
            [tweetUrl, shareText, hashtags]
        );

        res.json({ message: 'Twitter 分享数据更新成功' });
    } catch (error) {
        console.error('更新数据时出错:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

// 获取 Twitter 分享数据的接口
app.get('/api/twitter-share-data', async (req, res) => {
    try {
        const rows = await query('SELECT tweetUrl, shareText, hashtags FROM tweet');

        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ error: '未找到 Twitter 分享数据' });
        }
    } catch (error) {
        console.error('获取数据时出错:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
});
