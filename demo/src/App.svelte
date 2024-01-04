<script lang="ts">
  import { fileContent$, fileContentPromise$, midiFileURL$, file$ } from "./file";

  const onFileChange = (event: any) => {
    $file$ = event.target.files[0];
  };
</script>

<div class="container-fluid">
  <div class="mb-3 mt-3">
    <label for="formFile" class="form-label">Select a nwc or nwctxt file to display and/or convert to MIDI</label>
    <input class="form-control" type="file" id="formFile" on:change={onFileChange} />
  </div>

  {#if $fileContentPromise$}
    {#await $fileContentPromise$}
      Loading...
    {:catch error}
      <div class="alert alert-danger">An error occurred while reading the file.<br />{error}<br /> You can try opening another file.</div>
    {/await}
  {/if}

  {#if $midiFileURL$}
    <div class="mt-3">
      <a href={$midiFileURL$} download={$file$?.name.replace(/\.nwc(txt)?$/i, "") + ".mid"} class="btn btn-outline-primary">Download MIDI</a>
    </div>
  {/if}

  {#if $fileContent$}
    <pre class="mt-3"><code>{JSON.stringify($fileContent$, null, " ")}</code></pre>
  {/if}
</div>
