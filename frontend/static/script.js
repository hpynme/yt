// frontend/static/script.js
document.getElementById('playButton').addEventListener('click', async () => {
    const youtubeLink = document.getElementById('youtubeLink').value;
    const audioPlayer = document.getElementById('audioPlayer');
    const messageDisplay = document.getElementById('message');

    messageDisplay.textContent = 'অডিও লোড হচ্ছে...';
    audioPlayer.src = ''; // Clear previous audio

    try {
        // Flask app একই সার্ভার থেকে ফ্রন্টএন্ড এবং ব্যাকএন্ড সার্ভ করে।
        // তাই window.location.origin ব্যবহার করলে Render-এ ডিপ্লয় করার পর
        // স্বয়ংক্রিয়ভাবে সঠিক URL পেয়ে যাবে।
        const backendUrl = window.location.origin; 

        const response = await fetch(`${backendUrl}/play-youtube`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: youtubeLink })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Unknown error');
        }

        const data = await response.json();
        if (data.audio_url) {
            audioPlayer.src = data.audio_url;
            audioPlayer.play();
            messageDisplay.textContent = 'অডিও চলছে!';
        } else {
            messageDisplay.textContent = 'অডিও লিঙ্ক পাওয়া যায়নি।';
        }

    } catch (error) {
        console.error('Error:', error);
        messageDisplay.textContent = `ত্রুটি: ${error.message}`;
        alert(`একটি ত্রুটি হয়েছে: ${error.message}`);
    }
});

// অডিও প্লেয়ারের ত্রুটি হ্যান্ডেল করা
document.getElementById('audioPlayer').addEventListener('error', (e) => {
    const messageDisplay = document.getElementById('message');
    console.error('Audio playback error:', e);
    messageDisplay.textContent = 'অডিও চালাতে সমস্যা হয়েছে। লিঙ্কটি সঠিক কিনা বা অন্য কোনো সমস্যা হয়েছে কিনা দেখুন।';
});
              
