from youtube_transcript_api import YouTubeTranscriptApi
import requests
import re

# authorization key for the MeaningCloud API
key = 'here-goes-your-key'
# link to use the Summarization API
summary_api = "https://api.meaningcloud.com/summarization-1.0"
# link to use the Text Classification API
text_classification_api = "https://api.meaningcloud.com/class-2.0"
# link to use the Topic Extraction API
topic_extraction_api = "https://api.meaningcloud.com/topics-2.0"
# link to use the punctuation and grammar API
grammar_api = "http://bark.phon.ioc.ee/punctuator"
# default values for the response to HTTP requests
content = {'summary': "", 'full_Transcript': "",
           'text_Classification': "", 'tags': ""}

"""
This function takes in a video ID string and integer representing the number of sentences in the summary,
and returns a boolean indicating whether the summary was successfully generated
"""


def get_video_information(video_id, num_sentences):

    global content

    try:

        # Get a list of all transcripts of the video
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        # Get the English transcript of the video
        transcript = transcript_list.find_transcript(['en'])
        # Check if the transcript is automatically generated or if captions are available
        automated = transcript.is_generated
        transcript = transcript.fetch()

        # Holds the full transcript of the video in a nicer format
        result = ""
        for line in transcript:
            result += line['text'] + " "
        result = result.replace("\n", " ")

        # Add punctuation and grammar to the full transcript if the transcript is automatically generated
        if automated or "." not in result:
            response = requests.post(grammar_api, {'text': result})
            result = response.text

        # Remove brackets from the full transcript
        result = re.sub("[\(\[].*?[\)\]]", "", result)
        # Remove more useless punctuation from the full transcript
        result = result.replace(
            " --", ",").replace(" ...", "").replace("  ", " ")
        # Get the total number of sentencs in the full transcript
        sentences = result.count(". ")
        # Set the number of sentences for summary to at least 1 or (total number of sentences in the full transcript) X (desired length)
        num_of_sentences = max(1, round((num_sentences/100)*sentences))
        # Holds the final transcript
        full_transcript = result

        # Send HTTP request to Summarization API and get the summary of the video
        payload = {
            'key': key,
            'txt': full_transcript,
            'sentences': num_of_sentences,
        }
        response = requests.post(summary_api, data=payload)
        result = response.json()
        summary = result['summary']

        # Send HTTP request to Text Classification API and get the unique classification of the video
        payload = {
            'key': key,
            'txt': full_transcript,
            'model': 'IPTC_en'
        }
        response = requests.post(text_classification_api, data=payload)
        result = response.json()

        # Get each classification word and store it as a list
        classification = []
        for item in result['category_list']:
            classification.append(item['label'])

        # Send HTTP request to Topic Extraction API and get the tags of the video
        payload = {
            'key': key,
            'txt': full_transcript,
            'lang': 'en',
            'tt': 'a'
        }
        response = requests.post(topic_extraction_api, data=payload)
        result = response.json()

        # Get each tag of the video and store it as a list
        get_tags = []
        all_tags = result['concept_list'] + result['entity_list']
        for item in all_tags:
            if int(item['relevance']) >= 25 and item['form'] not in get_tags:
                get_tags.append(item['form'])

        # Store the information in content object to send back to the client
        content['full_Transcript'] = full_transcript
        content['summary'] = summary
        content['text_Classification'] = classification
        content['tags'] = get_tags

        return True

    # If anything goes wrong in try statement, don't update content object and return False
    except:
        return False


"""
This function responds to any HTTP request
It takes in the request parameter which is the HTTP request object
Returns a response object that includes information about the video as sourced from get_video_information()
"""


def respond(request):

    if request.method == 'OPTIONS':
        # Allows GET requests from any origin with the Content-Type header and caches preflight response for 3600 seconds
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Max-Age': '3600'
        }
        # 204 header is for no content
        return ('', 204, headers)

    # Set CORS headers for the main request
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }

    # Get the video ID and summary length parameters from the request
    request_json = request.get_json()

    # Check if the request is valid and has the proper information we need
    if request_json and 'video_ID' in request_json and 'summary_length' in request_json:
        # Get video information
        success = get_video_information(
            request_json['video_ID'], int(request_json['summary_length']))
        # Return a response object with the necessary information, along with success status
        return ({'success': success, 'summary': content['summary'], 'transcript': content['full_Transcript'], 'classification': content['text_Classification'], "tags": content['tags']}, 200, headers)

    # Otherwise return a response object with 200 OK header and an error message
    else:
        return ('Error: video ID or summary length not provided in request', 200, headers)
