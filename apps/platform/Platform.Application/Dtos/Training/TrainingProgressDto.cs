namespace Platform.Application.Dtos.Training;

public record TrainingProgressDto(
    int CurrentEpoch,
    int TotalEpochs,
    float Loss,
    float Accuracy,
    int Progress,       // 0..100
    string? Eta,        // 예: "00:12:34"
    string Status       // Running | Succeeded | Failed
);
