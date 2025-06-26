# backend/app.py

from flask import Flask, request, jsonify, render_template
import yt_dlp
import os

app = Flask(__name__,
            static_folder='../frontend/static', # ফ্রন্টএন্ডের স্ট্যাটিক ফাইল
            template_folder='../frontend')       # ফ্রন্টএন্ডের HTML ফাইল

# '/' রুট পাথ থেকে index.html ফাইলটি সার্ভ করবে
@app.route('/')
def index():
    return render_template('index.html')

# YouTube লিঙ্ক থেকে অডিও স্ট্রিম করার জন্য API এন্ডপয়েন্ট
@app.route('/play-youtube', methods=['POST'])
def play_youtube():
    data = request.json
    youtube_url = data.get('url')

    if not youtube_url:
        return jsonify({"error": "No URL provided"}), 400

    try:
        ydl_opts = {
            'format': 'bestaudio/best',
            'quiet': True,
            'no_warnings': True,
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(youtube_url, download=False)

            audio_url = None
            # চেষ্টা করুন সরাসরি অডিও URL খুঁজে বের করতে
            for f in info_dict.get('formats', []):
                if f.get('acodec') != 'none' and f.get('url'):
                    # mp4, webm, m4a ইত্যাদি ফরম্যাটগুলো দেখতে পারেন
                    # Render-এর জন্য সরাসরি URL পাওয়া গেলে ভালো
                    if f.get('ext') in ['m4a', 'mp4', 'webm', 'ogg', 'aac'] or 'audio' in f.get('vcodec', '').lower():
                        audio_url = f['url']
                        break

            if audio_url:
                return jsonify({"audio_url": audio_url}), 200
            else:
                return jsonify({"error": "Could not find a direct audio URL for this video or format not supported."}), 500

    except Exception as e:
        print(f"Error processing YouTube URL: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
